import bigcommerce
from colorama import Fore, Style
import pandas as pd

from bc_brands import get_brand_names

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


def parse_product_description(description_field):
    print(Fore.YELLOW + 'parsing product description...' + Style.RESET_ALL)
    description = description_field.strip()
    description_parts = description.split('     ')
    description_text = ''
    for i, part in enumerate(description_parts):
        if i == 0:
            description_text = '<p>%s</p>' % part
            if len(description_parts) > i+1:
                description_text += '<ul>'
            continue
        if i+1 == len(description_parts):
            if part.lower().find('note:') > -1:
                part = '<p>%s</p>' % part
            if description_text.find('<ul>') > -1 and description_text.find('</ul>') == -1:
                if part.find('<p>') > -1:
                    description_text += '</ul>%s' % part
                else:
                    description_text += '<li>%s</li></ul>' % part
            continue
        if description_text.find('<ul>') > -1 and description_text.find('</ul>') == -1:
            description_text += '<li>%s</li>' % part
    return description_text


def build_product_from_row(row):
    return {
        'name': row['PRODUCT_TITLE'].split(row['STYLE#'])[0].split('.')[0].strip().replace(' &#174;', '®'),
        'sku': row['STYLE#'],
        'price': round(float(row['CASE_PRICE'] * 1.4), 2),
        'categories': [203],
        'type': 'physical',
        'availability': 'available',
        'weight': row['PIECE_WEIGHT'],
        'description': parse_product_description(row['PRODUCT_DESCRIPTION'])
    }


def get_all_bc_styles():
    last_id = 0
    products = api.Products.all(limit=250, min_id=last_id)
    last_id = products[-1].id
    while len(products) % 250 == 0:
        products += api.Products.all(limit=250, min_id=last_id)
        last_id = products[-1].id
        print(Fore.YELLOW + ('%s products...' %
                             len(products)) + Style.RESET_ALL)
    products += api.Products.all(limit=250, min_id=last_id)
    print(Fore.GREEN + ('%s products...' % len(products)) + Style.RESET_ALL)
    # return list(map(lambda x: x., products))
    return [_.sku for _ in products]


def post_product(product):
    p_test = api.Products.all(sku=product['sku'])
    if type(p_test) is list:
        # products = list(filter(lambda x: x['name'] == product['name'], p_test))
        products = [p for p in p_test if p['sku'] == product['sku']]
        if len(products) > 0:
            print(Fore.YELLOW + ('found product with SKU %s...' %
                                 products[0].sku) + Style.RESET_ALL)
            return products[0]
    print(Fore.YELLOW + 'posting product...' + Style.RESET_ALL)
    # required fields: name, price, categories, type, availability, weight
    result = api.Products.create(name=product['name'], price=product['price'], categories=product['categories'], type='physical',
                                 availability='available', is_visible=False, weight=product['weight'], sku=product['sku'], description=product['description'])
    print(Fore.GREEN + str(result) + Style.RESET_ALL)
    return result


def create_product(df):
    print(Fore.YELLOW + ('creating product %s...' %
                         df['STYLE#']) + Style.RESET_ALL)
    product = build_product_from_row(df)
    # print(Fore.YELLOW + str(product) + Style.RESET_ALL)
    result = post_product(product)
    return result


def filter_new_styles(styles):
    bc_styles = get_all_bc_styles()
    return [s for s in styles if s not in bc_styles]


def filter_brand_styles(df, bc_styles):
    brands = get_brand_names()
    brand_styles = []
    unique_styles = [s for s in df['STYLE#'].unique() if s in bc_styles]
    for u_style in unique_styles:
        row = df[df['STYLE#'] == u_style].iloc[0]
        if row['MILL'] in brands:
            brand_styles.append(u_style)
            print(Fore.YELLOW + ('brand styles: %s' %
                                 len(brand_styles)) + Style.RESET_ALL)
    print(Fore.GREEN + ('brand styles: %s' %
                        len(brand_styles)) + Style.RESET_ALL)
    return brand_styles


def filter_df_styles(df, styles):
    new_product_df = pd.DataFrame(columns=df.columns)
    for s in styles:
        style_df = df[df['STYLE#'] == s]
        new_product_df = new_product_df.append(style_df, ignore_index=True)
        print('new product SKUs:', len(new_product_df))
    print(Fore.YELLOW + ('new product SKUs: %s' %
                         len(new_product_df)) + Style.RESET_ALL)
    return new_product_df


def filter_only_new_products(df):
    new_styles = filter_new_styles(df['STYLE#'].unique())
    # print(Fore.CYAN + 'Filtering brand styles...' + Style.RESET_ALL)
    # brand_styles = filter_brand_styles(df, bc_styles)
    print(Fore.CYAN + 'Filtering new styles...' + Style.RESET_ALL)
    return filter_df_styles(df, new_styles)
