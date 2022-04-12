import logging as log
import time
from datetime import date
import os

import bigcommerce
import pandas as pd
from colorama import Fore, Style

from bc_option import create_product_options
from bc_product_image import create_product_imgs
from bc_product_sku import create_product_skus
from bc_sanmar_color_imgs import save_mongo_document
from netsuite import add_product_to_netsuite_df

log_filename = './product-import-%s.log' % date.today().strftime('%m-%d-%y')
log.basicConfig(filename=log_filename, format='%(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S %p', level=log.INFO)

api = bigcommerce.api.BigcommerceApi(
            client_id=process.env.BG_AUTH_CLIENT, store_hash=process.env.STORE_HASH, access_token=process.env.BG_AUTH_TOKEN)


def get_all_products(last_id=0):
    products = api.Products.all(min_id=last_id, limit=250)
    while len(products) % 250 == 0:
        last_id = products[-1].id
        products += api.Products.all(min_id=last_id, limit=250)
        print('%s products...' % len(products))
    return products


def get_product(sku):
    p_test = api.Products.all(sku=sku)
    if type(p_test) is list:
        products = [p for p in p_test if p['sku'] == sku]
        if len(products) > 0:
            print(Fore.YELLOW + ('found product with SKU %s...' %
                                 products[0].sku) + Style.RESET_ALL)
            return products[0]


def get_sanmar_df():
    cwd_path = os.getcwd()
    sanmar_df = pd.read_csv('./SanMar_EPDD.csv' % cwd_path, header=0)
    sanmar_df = sanmar_df.drop_duplicates('UNIQUE_KEY')
    required_columns = ('UNIQUE_KEY', 'STYLE#', 'PRODUCT_TITLE', 'PRODUCT_DESCRIPTION', 'PIECE_WEIGHT', 'MILL', 'CASE_PRICE', 'SIZE', 'COLOR_SQUARE_IMAGE',
                        'COLOR_NAME', 'FRONT_FLAT_IMAGE', 'BACK_FLAT_IMAGE', 'FRONT_MODEL_IMAGE_URL', 'BACK_MODEL_IMAGE', 'SANMAR_MAINFRAME_COLOR')
    for c in sanmar_df.columns:
        if c not in required_columns:
            sanmar_df = sanmar_df.drop(c, axis=1)
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'The North Face']
    return sanmar_df


def import_products_into_bc(df):
    bc_products = get_all_products(3218)
    for i in range(0, len(bc_products)):
        p = bc_products[i]
        style = p.sku
        style_df = df[df['STYLE#'] == style]
        id_str = '%s: %s (%s/%s)' % (style, p.name,
                                     i, len(bc_products))
        print(Fore.CYAN + str(id_str) + Style.RESET_ALL)
        try:
            product = get_product(style)
            add_product_to_netsuite_df(product)
            if len(style_df) > 1:
                if type(product.skus()) != list:
                    # create options/values
                    create_product_options(product, style_df)
                    # create product SKUs
                    create_product_skus(product, style_df)
                    product = get_product(style)
                save_mongo_document(product, style_df)
        except Exception as e:
            err_str = '%s => %s' % (id_str, str(e))
            log.error(err_str)
            print(Fore.RED + err_str + Style.RESET_ALL)
            time.sleep(1)


if __name__ == "__main__":
    sanmar_df = get_sanmar_df()
    import_products_into_bc(sanmar_df)
