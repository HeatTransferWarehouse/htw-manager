from datetime import date
import time
import logging as log
from colorama import Fore, Style
import bigcommerce
import pandas as pd

from bc_product_sku import post_product_skus

log_filename = './product-import-%s.log' % date.today().strftime('%m-%d-%y')
log.basicConfig(filename=log_filename, format='%(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S %p', level=log.INFO)

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


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


def update_price(p, price):
    if str(price) != 'nan' and type(price) == float:
        r = p.update(price=price)
        print(Fore.GREEN + str(r) + Style.RESET_ALL)


def get_lowest_price(df):
    return min(df['CASE_PRICE'].values)


def update_product(p, df):
    min_price = get_lowest_price(df)
    df_price = round(float(min_price * 1.4), 2)
    if float(p['price']) != df_price:
        update_price(p, df_price)


def update_product_skus(p, df):
    skus = p.skus()
    if type(skus) != list:
        return
    for s in skus:
        print(s['sku'])
        s_row = df[df['UNIQUE_KEY'] == int(s['sku'])]
        if len(s_row) == 0:
            warn_str = 'sku %s not found in DF!' % s['sku']
            print(Fore.YELLOW + warn_str + Style.RESET_ALL)
            log.error(warn_str)
            continue
        s_row = s_row.iloc[0]
        df_price = round(float(s_row['CASE_PRICE'] * 1.4), 2)
        if float(s['adjusted_price'] if str(s['price']) == 'None' else s['price']) != df_price:
            update_price(s, df_price)


def process_bc_products(df):
    bc_products = get_all_products()
    bc_products.reverse()
    for i in range(0, len(bc_products)):
        try:
            p = bc_products[i]
            style = p.sku
            id_str = '%s: %s (%s/%s)' % (style, p.name,
                                         i, len(bc_products))
            print(Fore.CYAN + str(id_str) + Style.RESET_ALL)
            # get sub DF based on parent SKU == STYLE#
            style_df = df[df['STYLE#'] == style]
            update_product(p, style_df)
            if len(style_df) > 1:
                # map through each SKU and recalculate pricing
                update_product_skus(p, style_df)
        except Exception as e:
            err_str = '%s => %s' % (id_str, str(e))
            log.error(err_str)
            print(Fore.RED + err_str + Style.RESET_ALL)
            time.sleep(1)


bc_products = get_all_products()
for i, p in enumerate(bc_products):
    try:
        style = p.sku
        id_str = '%s: %s (%s/%s)' % (style, p.name, i, len(bc_products))
        print(Fore.CYAN + str(id_str) + Style.RESET_ALL)
        skus = post_product_skus(p.id)
        if type(skus) != list:
            continue
        for s in skus:
            print(Fore.CYAN + ('- %s' % s['sku']) + Style.RESET_ALL)
            if s.upc != '':
                r = s.update(upc='')
                print(Fore.YELLOW + str(r) + Style.RESET_ALL)
    except Exception as e:
        err_str = '%s => %s' % (id_str, str(e))
        print(Fore.RED + err_str + Style.RESET_ALL)
        time.sleep(5)
