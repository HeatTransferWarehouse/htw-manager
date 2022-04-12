import bigcommerce
from colorama import Fore, Style

api = bigcommerce.api.BigcommerceApi(
            client_id=process.env.BG_AUTH_CLIENT, store_hash=process.env.STORE_HASH, access_token=process.env.BG_AUTH_TOKEN)


def get_brand_names():
    try:
        brands = api.Brands.all(limit=250)
        return list(map(lambda x: x['name'], brands))
    except Exception as e:
        print(Fore.RED + str(e) + Style.RESET_ALL)
        return []
