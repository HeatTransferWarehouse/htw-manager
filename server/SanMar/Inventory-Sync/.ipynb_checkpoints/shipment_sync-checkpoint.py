import os
import logging as log
import pandas as pd
import os
import re
import bigcommerce
from ftplib import FTP
from datetime import date
from datetime import timedelta
from pathlib import Path

cwd_path = os.getcwd()
today = date.today()
logfilename = '%s/logs/%s-shipment.log' % (
    cwd_path, today.strftime('%y-%m-%d'))
log.basicConfig(filename=logfilename, format='%(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S %p', level=log.INFO)

global api
api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')


def getMostRecentShippingFiles():
    today_date = date.today()
    yesterday_date = today_date - timedelta(1)
    today_filename = str(today_date.strftime('%m-%d-%y') + 'status.txt')
    yesterday_filename = str(
        yesterday_date.strftime('%m-%d-%y') + 'status.txt')
    ftp = FTP('ftp.sanmar.com', '175733', 'Sanmar33')
    ftp.cwd('000175733Status')
    listing = []
    ftp.retrlines("NLST", listing.append)

    for filename in listing:
        if (filename == today_filename or filename == yesterday_filename):
            localfile = open(filename, 'wb')
            ftp.retrbinary('RETR ' + filename, localfile.write, 1024)
            ftp.quit()
            localfile.close()

    available_files = []
    today_file = Path(today_filename)
    yesterday_file = Path(yesterday_filename)

    if today_file.is_file():
        log.info('Found file %s...', today_filename)
        available_files.append(today_filename)
    if yesterday_file.is_file():
        log.info('Found file %s...', yesterday_filename)
        available_files.append(yesterday_filename)

    return available_files


def updateOrderStatus(current_po, order_status, notes=''):
    api.Orders.get(current_po).update(
        status_id=order_status, staff_notes=notes)


def sendShipment(shipment_dict):
    try:
        log.info('Submitting shipment for order %s...',
                 shipment_dict['order_id'])
        log.info(shipment_dict['items'])
        results = api.OrderShipments.create(
            parentid=shipment_dict['order_id'],
            order_address_id=shipment_dict['order_address_id'],
            tracking_number=shipment_dict['tracking_number'],
            shipping_provider=shipment_dict['shipping_provider'],
            items=shipment_dict['items']
        )
        return results
    except Exception as e:
        print(e)
        log.warning(e)
        # if(str(e).find('Read timed out') > -1):
        # 	return sendShipment(shipment_dict)
        # else:
        return str(e)


def buildShipment(po_lineitems, order_id):
    print('Building shipment for order', order_id, '...')
    log.info('Building shipment for order %s...', order_id)

    order_products = api.OrderProducts.all(parentid=order_id, limit=250)
    statusObj = {
        'shipment_id': 0,
        'order_status': 2 if len(po_lineitems) == len(order_products) else 3,
    }

    unique_tracking = po_lineitems['TRACK NUM'].unique()
    for track_num in unique_tracking:
        rows = po_lineitems[po_lineitems['TRACK NUM'] == track_num]
        if len(rows) > 0:
            row_index = rows.index[0]

            shipment_dict = {
                'order_id': order_id,
                'order_address_id': order_products[0].order_address_id,
                'tracking_number': track_num,
                'shipping_provider': 'UPS' if rows['SHIP VIA'][row_index].index('UPS') > -1 else '',
                'items': []
            }

            for i in range(0, len(rows)):
                product_sku = str(
                    rows['INVENTORY KEY'][i + row_index]) + str(rows['SIZE ID'][i + row_index])
                filtered_products = list(filter(lambda o: (
                    o['sku'] == product_sku and o['quantity_shipped'] < o['quantity']), order_products))
                if(len(filtered_products) > 0 and rows.iloc[i]['QTY'] > 0):
                    product = filtered_products[0]
                    shipment_dict['items'].append({
                        'order_product_id': product['product_options'][0]['order_product_id'],
                        'quantity': int(rows['QTY'][i + row_index])
                    })
            if (len(shipment_dict['items']) >= 1):
                results = sendShipment(shipment_dict)
                if (type(results) == str):
                    if(results.find('Read timed out') == -1):
                        updateOrderStatus(order_id, 12, results)
                elif (results.id != None):
                    statusObj['shipment_id'] = results.id
                    print('Shipment', results.id,
                          'created for order', order_id)
                    print('Carrier:', rows['SHIP VIA'][row_index])
                    print('Tracking #:', str(track_num))
                    print('Items: ', str(len(shipment_dict['items'])))
                    log.info('Shipment %s created for order %s',
                             results.id, order_id)
                    log.info('Carrier: %s', rows['SHIP VIA'][row_index])
                    log.info('Tracking #: %s', str(track_num))
                    log.info('Items: %s', str(len(shipment_dict['items'])))
            else:
                return 'No new shipments to create at this time'
    return statusObj


def main():
    available_files = getMostRecentShippingFiles()
    print(len(available_files), 'status files found')
    log.info('%s status files found...', len(available_files))
    for active_filename in available_files:
        shipping_table = pd.read_table(active_filename, index_col=False)
        current_po = 0
        for i in range(shipping_table['CUSTOMER PO'].size):
            if(shipping_table['CUSTOMER PO'][i] != current_po):
                current_po = shipping_table['CUSTOMER PO'][i]
                if(type(current_po) == str and re.search('[0-9]+', current_po) == None):
                    continue
                print('Processing order', current_po, '...')
                log.info('Processing order %s...', current_po)
                po_lineitems = shipping_table[shipping_table['CUSTOMER PO'] == current_po]
                print(len(po_lineitems), 'line items found...')
                log.info('%s line items found...', len(po_lineitems))
                order = {
                    'status_id': 0
                }
                try:
                    order = api.Orders.get(current_po)
                except Exception as e:
                    order = {
                        'status_id': 0
                    }
                print(order['status_id'])
                if(order['status_id'] > 2):
                    while True:
                        try:
                            result = buildShipment(po_lineitems, order.id)
                            if(type(result) == dict):
                                if(result['shipment_id'] != 0):
                                    updateOrderStatus(
                                        current_po, result['order_status'])
                                else:
                                    updateOrderStatus(current_po, 12, '')
                            else:
                                log.info('%s...', str(result))
                        except Exception as e:
                            print(e)
                            log.warning(e)
                            if(str(e).find('Read timed out') == -1):
                                updateOrderStatus(current_po, 12, str(e))
                            pass
                        break
                else:
                    log.info('Order %s already shipped, moving on...', current_po)
    else:
        log.warning('No files found...')
# END DEFS


main()
