import bigcommerce
from pymongo import MongoClient
from functools import reduce
from colorama import Fore, Style

MONGO_HOST = "192.241.149.120"
MONGO_DB = "heattransferclothing"
MONGO_USER = "htc_admin"
MONGO_PASS = "ppw3J37W"
SSH_USER = "root"
SSH_PASS = "22Pixie@"

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')
client = MongoClient(
    'mongodb://%s:%s@192.241.149.120' % (MONGO_USER, MONGO_PASS), authSource='admin')
db = db = client[MONGO_DB]
products_collection = db['products']


def find_color_option(x, y):
    if y['display_name'] == 'Color':
        x = y
    return x


def normalize_img_url(img, row):
    if img.find('https://') > -1:
        return img
    url_base = row['FRONT_MODEL_IMAGE_URL'].split(row['STYLE#'])[0]
    return '%s%s' % (url_base, img)


def get_color_images_from_row(row):
    image_array = []
    for field in ['FRONT_FLAT_IMAGE', 'BACK_FLAT_IMAGE', 'FRONT_MODEL_IMAGE_URL', 'BACK_MODEL_IMAGE']:
        try:
            color_img = row[field]
            if len(str(color_img)) > 3:
                img_url = normalize_img_url(color_img, row)
                image_array.append(img_url)
        except Exception as e:
            print(e)
    return image_array


def save_mongo_document(product, df):
    print(Fore.YELLOW + ('saving %s (%s) to database...' %
                         (product.sku, product.id)) + Style.RESET_ALL)
    product_count = products_collection.count({'product_id': product.id})
    if product_count > 0:
        return
    print('found %s products...' % product_count)
    # if record and record['options'][0]['imgURLs'][0].find('dtype') > -1:
    #     products_collection.delete_one({'product_id': product.id})
    #     return
    product_options = product.options()
    if type(product_options) != list:
        print(Fore.RED + 'Product has no options!!!' + Style.RESET_ALL)
        return
    color_option = reduce((find_color_option), product_options)
    if color_option == None:
        print(Fore.RED + 'Product has no colors!!!' + Style.RESET_ALL)
        return
    color_values = api.OptionValues.all(parentid=color_option['option_id'])
    if type(color_values) != list:
        print(Fore.RED + 'Product has no colors!!!' + Style.RESET_ALL)
        return
    image_dict = {
        'product_id': product.id,
        'sku': product.sku,
        'attribute': color_option['id'],
        'options': []
    }
    for value in color_values:
        print(value['label'])
        colors = df[df['COLOR_NAME'] == value['label']]
        if len(colors) == 0:
            continue
        row = colors.iloc[0]
        image_array = get_color_images_from_row(row)
        image_dict['options'].append({
            'value': value['id'],
            'imgURLs': image_array
        })
    print(str(image_dict))
    result = products_collection.insert_one(image_dict)
    print('One product: {0}'.format(result.inserted_id))
