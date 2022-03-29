import bigcommerce
import pandas as pd
from colorama import Fore, Style
from datetime import date

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


def add_product_to_netsuite_df(product):
    print(Fore.YELLOW + 'saving product to netsuite sheet...' + Style.RESET_ALL)
    netsuite_df = pd.DataFrame(
        columns=['SKU', 'Name', 'Price', 'Can Be Fulfilled'])
    try:
        netsuite_df = pd.read_csv('netsuite-%s.csv' %
                                  date.today().strftime('%m-%d-%y'), header=0)
    except Exception as e:
        print(str(e))
        netsuite_df = pd.DataFrame(
            columns=['SKU', 'Name', 'Price', 'Can Be Fulfilled'])

    skus = api.ProductSkus.all(parentid=product.id, limit=250)
    while len(skus) % 250 == 0:
        last_id = skus[-1]['id']
        skus += api.ProductSkus.all(parentid=product.id,
                                    limit=250, min_id=last_id)
    print(Fore.CYAN + ('%s skus...' % len(skus)) + Style.RESET_ALL)
    if type(skus) == list:
        for s in skus:
            price = float(product.price) if s['price'] is None else float(
                s['price'])
            row_dict = {
                'SKU': str(s['sku']),
                'Name': product.name,
                'Price': price,
                'Can Be Fulfilled': False,
            }
            print(row_dict)
            netsuite_df = netsuite_df.append(row_dict, ignore_index=True)
    else:
        row_dict = {
            'SKU': product.sku,
            'Name': product.name,
            'Price': float(product.price),
            'Can Be Fulfilled': False,
        }
        print(row_dict)
        netsuite_df = netsuite_df.append(row_dict, ignore_index=True)
    print(Fore.CYAN + ('netsuite length: %s' %
                       str(len(netsuite_df))) + Style.RESET_ALL)
    netsuite_df.to_csv('netsuite-%s.csv' %
                       date.today().strftime('%m-%d-%y'), encoding='utf-8', index=False)
