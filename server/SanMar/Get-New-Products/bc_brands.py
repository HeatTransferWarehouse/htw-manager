import bigcommerce
from colorama import Fore, Style

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


def get_brand_names():
    try:
        brands = api.Brands.all(limit=250)
        return list(map(lambda x: x['name'], brands))
    except Exception as e:
        print(Fore.RED + str(e) + Style.RESET_ALL)
        return []
