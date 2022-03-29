import bigcommerce
import random
from colorama import Fore, Style
import time

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


def get_product_images(product_id):
    product_images = api.ProductImages.all(parentid=product_id)
    product_images = product_images if type(product_images) is list else []
    return product_images


def pick_random_color_from_df(df):
    color_names = list(df['COLOR_NAME'].unique())
    not_boring_colors = list(
        filter(lambda x: x != 'White' and x != 'Black', color_names))
    if len(not_boring_colors) > 0:
        random_color_index = random.randint(0, len(not_boring_colors)-1)
        return not_boring_colors[random_color_index]
    return color_names[0]


def normalize_img_url(img, row):
    if img.find('https://') > -1:
        return img
    url_base = row['FRONT_MODEL_IMAGE_URL'].split(row['STYLE#'])[0]
    return '%s%s' % (url_base, img)


def get_random_color_images(df):
    color_images = []
    random_color = pick_random_color_from_df(df)
    color_row = df[df['COLOR_NAME'] == random_color].iloc[0]
    for field in ['FRONT_FLAT_IMAGE', 'BACK_FLAT_IMAGE', 'FRONT_MODEL_IMAGE_URL', 'BACK_MODEL_IMAGE']:
        try:
            color_img = color_row[field]
            if len(str(color_img)) > 3:
                img_url = normalize_img_url(color_img, color_row)
                color_images.append(img_url)
        except Exception as e:
            print('get_random_color_images', e)
    return color_images


def create_product_imgs(product_id, df):
    print(Fore.YELLOW + 'creating product images...' + Style.RESET_ALL)
    product_images = get_product_images(product_id)
    color_images = get_random_color_images(df)
    if len(color_images) <= len(product_images):
        return
    for i, img in enumerate(color_images):
        while True:
            try:
                print(Fore.YELLOW + ('posting product image %s...' %
                                     img) + Style.RESET_ALL)
                result = api.ProductImages.create(
                    parentid=product_id, image_file=img, is_thumbnail=i == 0)
                print(Fore.GREEN + str(result) + Style.RESET_ALL)
                time.sleep(0.25)
            except Exception as e:
                print('get_random_color_images', e)
            break
