import time

import bigcommerce
from colorama import Fore, Style

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


def annouce_sleep(seconds):
    print('sleeping %s seconds...' % seconds)
    time.sleep(seconds)


failed = []
min_id = 2286
products = api.Products.all(limit=250, min_id=min_id)
while len(products) % 250 == 0:
    last_id = products[-1]['id']
    products += api.Products.all(limit=250, min_id=last_id)
    print(len(products))
print(Fore.GREEN + str(len(products)) + Style.RESET_ALL)

for product in products:
    print(Fore.CYAN + product['name'] + Style.RESET_ALL)
    try:
        rules = api.ProductDiscountRules.all(parentid=product.id)
        if type(rules) == list and len(rules) == 2:
            print(Fore.YELLOW + 'skipping...' + Style.RESET_ALL)
            continue
        result_one = api.ProductDiscountRules.create(
            parentid=product.id, min=6, max=10, type='percent', type_value=5)
        print(Fore.GREEN + str(result_one) + Style.RESET_ALL)
        result_two = api.ProductDiscountRules.create(
            parentid=product.id, min=11, type='percent', type_value=7.5)
        print(Fore.GREEN + str(result_two) + Style.RESET_ALL)
        annouce_sleep(0.25)
    except Exception as e:
        failed += product.id
        print(Fore.RED)
        print('-----')
        print('%s (%s): %s' % (product.name, product.id, str(e)))
        print('-----')
        print(Style.RESET_ALL)
        annouce_sleep(2)
print(failed)
print(len(failed))
