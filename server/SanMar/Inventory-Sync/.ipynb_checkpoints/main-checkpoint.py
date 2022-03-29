import os
import time
from datetime import date
from ftplib import FTP

import pandas as pd

from bc_connection import BC
from log import Log
from mail import Mail

bc = BC()
log = Log()
mail = Mail()
cwd_path = os.getcwd()


def build_email_body(config):
    return '''
	<p><strong>SKUs updated:</strong><br>%s</p>
	<p><strong>Time elapsed:</strong><br>%s</p>
	<p>&nbsp;</p>
	<p><strong>Inactive products:</strong><br>%s</p>
	''' % (config['skus_updated'], config['elapsed_time'], ', '.join(config['inactive_products']))


def send_status_email(config):
    subject = '[HTC Inventory Report] %s' % date.today().strftime('%y-%m-%d')
    body = build_email_body(config)
    mail.send_email(
        subject, body, ['tre@heattransferwarehouse.com'])


def send_error_email(err):
    subject = '[HTC Inventory Error]'
    body = '<p>%s</p>' % str(err)
    mail.send_email(subject, body, ['tre@heattransferwarehouse.com'])


def parse_elapsed_time(start, end):
    elapsed_time = end - start
    return time.strftime("%H:%M:%S", time.gmtime(elapsed_time))


def download_inventory_file(filename):
    ftp = FTP('ftp.sanmar.com', '175733', 'Sanmar33')
    ftp.cwd('SanMarPDD')
    localfile = open('%s/data/%s' % (cwd_path, filename), 'wb')
    ftp.retrbinary('RETR ' + filename, localfile.write, 1024)
    ftp.quit()
    localfile.close()


def find_inactive_products(sanmar, bc_products):
    bc_skus = set(map(lambda x: x.sku, bc_products))
    unique_styles = sanmar['catalog_no'].unique()
    return set([s for s in bc_skus if s not in unique_styles])


def update_sku_inventory(product, skus, df):
    updated_sku_count = 0
    for s in skus:
        sku_df = df[df['unique_key'] == int(s['sku'])]
        if len(sku_df) == 0:
            continue
        inventory_level = max(sum(sku_df['quantity'].values), 0)
        inv_str = '%s (%s) %s => %s' % (
            s['sku'], product.sku, s['inventory_level'], str(inventory_level))
        diff_over_100 = abs(s['inventory_level'] - inventory_level) < 100
        low_inventory = (inventory_level < 20 or s['inventory_level'] < 20) and not (
            inventory_level < 20 and s['inventory_level'] < 20)
        if diff_over_100 and not low_inventory:
            continue
        try:
            s.update(inventory_level=int(inventory_level))
            log.success(inv_str)
            updated_sku_count += 1
        except Exception as e:
            err_str = '%s (%s) => %s' % (s['sku'], product.sku, str(e))
            log.error(err_str)
    return updated_sku_count


def update_inventory_from_file(sanmar, bc_products):
    updated_count = 0
    total_count = 0
    for i, p in enumerate(bc_products):
        while True:
            p_str = 'Processing product %s (%s of %s)' % (
                p.id, i + 1, len(bc_products))
            log.info(p_str)
            skus = bc.get_product_skus(p.id)
            total_count += len(skus)
            df = sanmar[sanmar['catalog_no'] == p.sku]
            if len(df) == 0:
                break
            updated_count += update_sku_inventory(p, skus, df)
            break
    return '%s / %s' % (updated_count, total_count)


def reduce_df(filepath):
    required_columns = ['whse_no', 'quantity', 'catalog_no', 'unique_key']
    sanmar_df = pd.read_csv(filepath, sep='|', header=0)
    for c in sanmar_df.columns:
        if c not in required_columns:
            sanmar_df = sanmar_df.drop(c, axis=1)
    return sanmar_df


def get_inventory_file(path, filename):
    filepath = '%s/%s' % (path, filename)
    try:
        f = open(filepath)
        f.close()
        return reduce_df(filepath)
    except IOError:
        log.info('downloading file %s...' % filename)
        download_inventory_file(filename)
        return reduce_df(filepath)


def start_inventory_update(filepath, filename):
    body_config = {
        'start_time': 0,
        'end_time': 0,
        'elapsed_time': 0,
        'inactive_products': [],
        'skus_updated': 0
    }
    body_config['start_time'] = time.perf_counter()
    df = get_inventory_file(filepath, filename)
    if df.empty:
        log.error('could not find file...')
        return
    log.info('fetching BigCommerce products...')
    bc_products = bc.get_all_products(0)
    if date.today().weekday() % 2 == 0:
        bc_products.reverse()
    log.success('%s products found!' % len(bc_products))
    body_config['inactive_products'] = find_inactive_products(df, bc_products)
    log.warn('%s inactive products found!' %
             len(body_config['inactive_products']))
    body_config['skus_updated'] = update_inventory_from_file(df, bc_products)
    log.success('%s SKUs updated!' % body_config['skus_updated'])
    body_config['end'] = time.perf_counter()
    body_config['elapsed_time'] = parse_elapsed_time(
        body_config['start_time'], body_config['end'])
    # send status email
    send_status_email(body_config)
    # delete local file
    os.remove('%s/%s' % (filepath, filename))
    log.warn('%s deleted.' % filename)
    log.success('DONE! %s' % body_config['elapsed_time'])


if __name__ == "__main__":
    filepath = '%s/data' % cwd_path
    filename = 'sanmar_activeproductsexport.txt'
    start_inventory_update(filepath, filename)
