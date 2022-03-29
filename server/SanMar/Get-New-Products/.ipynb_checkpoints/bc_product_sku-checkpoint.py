import datetime
import logging as log
import time
from functools import reduce

import bigcommerce
from colorama import Fore, Style
from sanmar_connection import Sanmar

# Global variables
date = datetime.date
log_filename = './product-skus-%s.log' % date.today().strftime('%m-%d-%y')
log.basicConfig(filename=log_filename, format='%(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S %p', level=log.INFO)
api = bigcommerce.api.BigcommerceApi(host='www.heattransferwarehouse.com', basic_auth=(
    'Main', 'a1hgctnb1aabqsqzwjua1dtgbov3xfp'))
sanmar = Sanmar()


def findColorOption(x, y):
    if y['display_name'] == 'Color':
        x = y
    return x


def findSizeOption(x, y):
    if y['display_name'] == 'Size':
        x = y
    return x


def post_product_skus(product, sku_list):
    print(Fore.YELLOW + 'posting product skus...' + Style.RESET_ALL)
    for sku in sku_list:
        print(Fore.CYAN + ('%s...' % sku['sku']) + Style.RESET_ALL)
        if sku['sku'] is None:
            print(Fore.YELLOW + ('--RECHECK-- unable to match SKU in product: %s (%s)...' %
                                 (product['name'], product['sku'])) + Style.RESET_ALL)
            print(Fore.YELLOW + str(sku['options']) + Style.RESET_ALL)
            log.info('--RECHECK-- unable to match SKU in product: %s (%s)...' %
                     (product['name'], product['sku']))
            log.info(str(sku['options']))
            continue
        if type(api.ProductSkus.all(parentid=product['id'], sku=sku['sku'])) is not list:
            print(Fore.YELLOW + ('posting %s...' %
                                 sku['sku']) + Style.RESET_ALL)
            result = api.ProductSkus.create(
                parentid=product['id'], sku=sku['sku'], price=sku['price'], options=sku['options'])
            print(Fore.GREEN + str(result) + Style.RESET_ALL)
            time.sleep(0.25)
            continue
        print(Fore.YELLOW + ('--RECHECK-- SKU already exists: %s (%s) moving on...' %
                             (product['name'], sku['sku'])) + Style.RESET_ALL)
        log.info('--RECHECK-- SKU already exists: %s (%s) moving on...' %
                 (product['name'], sku['sku']))


def check_for_product_options(product):
    product_options = product.options()
    if type(product_options) != list:
        option_sets = api.OptionSets.all(display_name=product.sku)
        option_set = None if type(option_sets) != list else option_sets[0]
        if option_set == None:
            return None
        product.update(option_set_id=option_set['id'])
        product_options = product.options()
        if type(product_options) != list:
            return None
    return product_options


def create_product_skus(product, df):
    print(Fore.YELLOW + 'creating product skus...' + Style.RESET_ALL)
    product_options = check_for_product_options(product)
    if product_options == None:
        print(Fore.RED + ('%s: tried creating product skus, found no options...' %
                          product.sku) + Style.RESET_ALL)
        time.sleep(5)
        return
    color_option = reduce((findColorOption), product_options)
    color_values = api.OptionValues.all(parentid=color_option['option_id'])
    size_option = reduce((findSizeOption), product_options)
    size_values = api.OptionValues.all(parentid=size_option['option_id'])
    sku_list = []
    for i in range(0, len(df)):
        row = df.iloc[i]
        sku = str(row['UNIQUE_KEY'])
        color = row['COLOR_NAME']
        size = row['SIZE']
        inventory = 0
        try:
            response = sanmar.getInventoryQtyForStyleColorSize(
                product.sku, row['SANMAR_MAINFRAME_COLOR'], size)
            if not response['errorOccurred']:
                inventory = sum(response['listResponse'])
                inventory = inventory if inventory > 0 else 0
        except Exception as e:
            print(str(e))

        price = round(float(row['CASE_PRICE'] * 1.4), 2)
        print(Fore.YELLOW + ('creating %s (%s + %s)...' %
                             (sku, color, size)) + Style.RESET_ALL)
        color_value = list(
            filter(lambda x: x['label'] == color, color_values))[0]
        size_value = list(filter(lambda x: x['label'] == size, size_values))[0]
        sku_list.append({
            'sku': sku,
            'price': price,
            'inventory': inventory,
            'options': [
                        {
                            'product_option_id': color_option['id'],
                            'option_value_id': color_value['id']
                        },
                        {
                            'product_option_id': size_option['id'],
                            'option_value_id': size_value['id']
                        }
                        ]
        })
    post_product_skus(product, sku_list)
    product.update(inventory_tracking='sku' if len(sku_list) > 0 else 'simple')
