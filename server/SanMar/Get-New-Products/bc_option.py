import bigcommerce
import random
from colorama import Fore, Style
import time

api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


def post_option_set(os_name):
    os_result = api.OptionSets.all(name=os_name)
    if type(os_result) == list:
        return os_result[0]
    else:
        os_result = api.OptionSets.create(name=os_name)
        print(Fore.GREEN + str(os_result) + Style.RESET_ALL)
        return os_result


def post_option(os_name, field_label, field_type='S'):
    option_name = '%s (%s)' % (field_label, os_name)
    result = api.Options.all(name=option_name)
    if type(result) == list:
        return result[0]
    create_result = api.Options.create(
        display_name=field_label, name=option_name, type=field_type)
    print(Fore.GREEN + str(create_result) + Style.RESET_ALL)
    return create_result


def post_option_values(option, option_values):
    if type(option_values[0]) == str:
        option_values = list(
            map(lambda x: {'label': x, 'value': x}, option_values))
    values = option_values
    ovs = api.OptionValues.all(parentid=option['id'], limit=250)
    if type(ovs) == list:
        ov_labels = list(map(lambda x: x['label'], ovs))
        print(Fore.YELLOW + ('%s option values found...' %
                             len(ov_labels)) + Style.RESET_ALL)
        values = list(
            filter(lambda x: x['label'] not in ov_labels, option_values))
        print(Fore.CYAN + ('%s new option values...' %
                           len(values)) + Style.RESET_ALL)
    for value in values:
        print(Fore.CYAN + ('%s %s %s' %
                           (option['name'], value['label'], value['value'])) + Style.RESET_ALL)
        ov_result = api.OptionValues.create(
            parentid=option['id'], label=value['label'], value=value['value'])
        print(Fore.GREEN + ('%s option value created: %s' %
                            (option['name'].upper(), ov_result['label'])) + Style.RESET_ALL)
        time.sleep(0.25)


def build_post_size_options(option_set, df):
    print('creating size options for %s...' % option_set['name'])
    size_option = post_option(option_set['name'], 'Size', 'S')
    time.sleep(0.25)
    if size_option is not None:
        print('size option:', size_option['name'].upper())
        # add size option to product option set already assigned to parent product
        oso = api.OptionSetOptions.all(parentid=option_set['id'])
        if type(oso) == list:
            if size_option['display_name'] not in list(map(lambda x: x['display_name'], oso)):
                api.OptionSetOptions.create(
                    parentid=option_set['id'], option_id=size_option['id'], is_required=True)
                time.sleep(0.25)
        else:
            api.OptionSetOptions.create(
                parentid=option_set['id'], option_id=size_option['id'], is_required=True)
            time.sleep(0.25)
        unique_sizes = list(df['SIZE'].unique())
        # create option values
        post_option_values(size_option, unique_sizes)


def build_post_color_options(option_set, df):
    print('creating color options for %s...' % option_set['name'])
    # create option [PRODUCT NAME] - [color LABEL], Dropdown
    color_option = post_option(option_set['name'], 'Color', 'CS')
    time.sleep(0.25)
    if color_option is not None:
        print('color option:', color_option['name'].upper())
        # add color option to product option set already assigned to parent product
        oso = api.OptionSetOptions.all(parentid=option_set['id'])
        if type(oso) == list:
            if color_option['display_name'] not in list(map(lambda x: x['display_name'], oso)):
                api.OptionSetOptions.create(
                    parentid=option_set['id'], option_id=color_option['id'], is_required=True)
                time.sleep(0.25)
        else:
            api.OptionSetOptions.create(
                parentid=option_set['id'], option_id=color_option['id'], is_required=True)
            time.sleep(0.25)
        swatch_list = []
        # get unique color values from DF
        unique_colors = list(df['COLOR_NAME'].unique())
        for color in unique_colors:
            color_df = df[df['COLOR_NAME'] == color]
            if len(color_df) > 0:
                swatch_list.append({
                    'label': color,
                    'value': 'https://cdnl.sanmar.com/swatch/gifs/%s' % color_df.iloc[0]['COLOR_SQUARE_IMAGE']
                })
        # create option values
        post_option_values(color_option, swatch_list)


def create_product_options(product, df):
    print(Fore.YELLOW + 'creating product options...' + Style.RESET_ALL)
    option_set = post_option_set(product.sku)
    product.update(option_set_id=option_set['id'])
    build_post_color_options(option_set, df)
    build_post_size_options(option_set, df)
