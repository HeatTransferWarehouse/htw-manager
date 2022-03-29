import logging as log
import time
from datetime import date
import os
import sys
os.system('python3 -m pip install {}'.format(sys.argv[1]))
os.system('python3 -m pip install {}'.format(sys.argv[2]))
os.system('python3 -m pip install {}'.format(sys.argv[3]))
os.system('python3 -m pip install {}'.format(sys.argv[4]))
os.system('python3 -m pip install {}'.format(sys.argv[5]))
os.system('python3 -m pip install {}'.format(sys.argv[6]))
os.system('python3 -m pip install {}'.format(sys.argv[7]))

import pandas as pd
from colorama import Fore, Style

from bc_brands import get_brand_names
from bc_option import create_product_options
from bc_product import create_product, filter_only_new_products
from bc_product_image import create_product_imgs
from bc_product_sku import create_product_skus
from bc_sanmar_color_imgs import save_mongo_document
from netsuite import add_product_to_netsuite_df

log_filename = './product-import-%s.log' % date.today().strftime('%m-%d-%y')
log.basicConfig(filename=log_filename, format='%(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S %p', level=log.INFO)


def get_sanmar_df():
    cwd_path = os.getcwd()
    sanmar_df = pd.read_csv('%s/data/SanMar_EPDD.csv' % cwd_path, header=0)
    sanmar_df = sanmar_df.drop_duplicates('UNIQUE_KEY')
    required_columns = ('UNIQUE_KEY', 'STYLE#', 'PRODUCT_TITLE', 'PRODUCT_DESCRIPTION', 'PIECE_WEIGHT', 'MILL', 'CASE_PRICE', 'SIZE', 'COLOR_SQUARE_IMAGE', 'COLOR_NAME', 'FRONT_FLAT_IMAGE', 'BACK_FLAT_IMAGE', 'FRONT_MODEL_IMAGE_URL', 'BACK_MODEL_IMAGE', 'SANMAR_MAINFRAME_COLOR')
    for c in sanmar_df.columns:
        if c not in required_columns:
            sanmar_df = sanmar_df.drop(c, axis=1)
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'OGIO']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'Nike']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'The North Face']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'Carhartt']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'Champion']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'Cotopaxi']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'Travis Mathew']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'New Era']
    sanmar_df = sanmar_df[sanmar_df['MILL'] != 'Eddie Bauer']
    sanmar_df = sanmar_df[sanmar_df['PRODUCT_TITLE'].str.contains(pat = 'DISCONTINUED') != True]
    sanmar_df = sanmar_df[sanmar_df['PRODUCT_TITLE'].str.contains(pat = 'OGIO') != True]
    return sanmar_df


def import_products_into_bc(df):
    unique_styles = df['STYLE#'].unique()
    for i in range(0, len(unique_styles)):
        style = unique_styles[i]
        style_df = df[df['STYLE#'] == style]
        product_title = style_df.iloc[0]['PRODUCT_TITLE'].replace(
            ' &#174;', '®')
        id_str = '%s: %s (%s/%s)' % (style, product_title,
                                     i, len(unique_styles))
        print(Fore.CYAN + str(id_str) + Style.RESET_ALL)
        try:
            # 1. build product from DF
            product = create_product(style_df.iloc[0])
            # 2. create product images from DF
            create_product_imgs(product.id, style_df)
            # 3. save product to netsuite sheet
            # add_product_to_netsuite_df(product)
            if len(style_df) > 1:
                # 4. create options/values
                create_product_options(product, style_df)
                # 5. create product SKUs
                create_product_skus(product, style_df)
                # 6. save color images and thumbnails to mlab
                save_mongo_document(product, style_df)
                # 7. update key-color map sheet
                # update_uniquekey_color_map(product, style_df)
        except Exception as e:
            err_str = '%s => %s' % (id_str, str(e))
            log.error(err_str)
            print(Fore.RED + err_str + Style.RESET_ALL)
            time.sleep(1)


if __name__ == "__main__":
    sanmar_df = get_sanmar_df()
    not_in_bc = filter_only_new_products(sanmar_df)
    if len(not_in_bc) > 0:
        import_products_into_bc(not_in_bc)
    else:
        print('no new products to add to BC')
