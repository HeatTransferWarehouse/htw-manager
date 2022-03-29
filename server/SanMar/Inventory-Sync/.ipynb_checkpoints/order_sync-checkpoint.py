import os
from datetime import date
from datetime import datetime
from datetime import timedelta
import logging as log
import os
import re
import smtplib
import pandas as pd
import bigcommerce
import zeep
from bc_connection import BC

today = date.today()
cwd_path = os.getcwd()
today = date.today()
logfilename = '%s/logs/%s-order.log' % (
    cwd_path, today.strftime('%y-%m-%d'))
log.basicConfig(filename=logfilename, format='%(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S %p', level=log.INFO)

bc = BC()

ORDER_STATUS_AWAITING_SHIPMENT = 9
ORDER_STATUS_MANUAL_VERIFICATION_REQUIRED = 12

CUSTOMER_NUMBER = '175733'
CUSTOMER_USERNAME = 'htw2014'
# dev password
# CUSTOMER_PASSWORD = '12341234'
# production password
CUSTOMER_PASSWORD = 'Htw$2014'
# dev wsdl
# wsdl = 'https://uat-ws.sanmar.com:8080/SanMarWebService/SanMarPOServicePort?wsdl'
# production wsdl
wsdl = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarPOServicePort?wsdl'
client = zeep.Client(wsdl=wsdl)
factory = client.type_factory('ns0')
webServiceUser = factory.webServiceUser(
    sanMarCustomerNumber=CUSTOMER_NUMBER,
    sanMarUserName=CUSTOMER_USERNAME,
    sanMarUserPassword=CUSTOMER_PASSWORD
)


def parse_state(input):
    state = ''
    if input == 'Alabama':
        state = 'AL'
    elif input == 'Alaska':
        state = 'AK'
    elif input == 'Arizona':
        state = 'AZ'
    elif input == 'Arkansas':
        state = 'AR'
    elif input == 'California':
        state = 'CA'
    elif input == 'Colorado':
        state = 'CO'
    elif input == 'Connecticut':
        state = 'CT'
    elif input == 'Delaware':
        state = 'DE'
    elif input == 'District of Columbia':
        state = 'DC'
    elif input == 'Florida':
        state = 'FL'
    elif input == 'Georgia':
        state = 'GA'
    elif input == 'Hawaii':
        state = 'HI'
    elif input == 'Idaho':
        state = 'ID'
    elif input == 'Illinois':
        state = 'IL'
    elif input == 'Indiana':
        state = 'IN'
    elif input == 'Iowa':
        state = 'IA'
    elif input == 'Kansas':
        state = 'KS'
    elif input == 'Kentucky':
        state = 'KY'
    elif input == 'Louisiana':
        state = 'LA'
    elif input == 'Maine':
        state = 'ME'
    elif input == 'Maryland':
        state = 'MD'
    elif input == 'Massachusetts':
        state = 'MA'
    elif input == 'Michigan':
        state = 'MI'
    elif input == 'Minnesota':
        state = 'MN'
    elif input == 'Mississippi':
        state = 'MS'
    elif input == 'Missouri':
        state = 'MO'
    elif input == 'Montana':
        state = 'MT'
    elif input == 'Nebraska':
        state = 'NE'
    elif input == 'Nevada':
        state = 'NV'
    elif input == 'New Hampshire':
        state = 'NH'
    elif input == 'New Jersey':
        state = 'NJ'
    elif input == 'New Mexico':
        state = 'NM'
    elif input == 'New York':
        state = 'NY'
    elif input == 'North Carolina':
        state = 'NC'
    elif input == 'North Dakota':
        state = 'ND'
    elif input == 'Ohio':
        state = 'OH'
    elif input == 'Oklahoma':
        state = 'OK'
    elif input == 'Oregon':
        state = 'OR'
    elif input == 'Pennsylvania':
        state = 'PA'
    elif input == 'Rhode Island':
        state = 'RI'
    elif input == 'South Carolina':
        state = 'SC'
    elif input == 'South Dakota':
        state = 'SD'
    elif input == 'Tennessee':
        state = 'TN'
    elif input == 'Texas':
        state = 'TX'
    elif input == 'Utah':
        state = 'UT'
    elif input == 'Vermont':
        state = 'VT'
    elif input == 'Virginia':
        state = 'VA'
    elif input == 'Washington':
        state = 'WA'
    elif input == 'West Virginia':
        state = 'WV'
    elif input == 'Wisconsin':
        state = 'WI'
    elif input == 'Wyoming':
        state = 'WY'
    else:
        state = 'FALL THROUGH'
    return state


def parse_shipping_method(bc_method):
    method = 'UPS'
    if (bc_method.find('next') > -1):
        method += ' NEXT DAY'
    elif (bc_method.find('2') > -1):
        method += ' 2ND DAY'
    elif (bc_method.find('3') > -1):
        method += ' 3RD DAY'
    elif (bc_method.find('freight') > -1 or bc_method.find('truck') > -1):
        method += ' TRUCK'
    return method


def verify_order_address(billing, shipping):
    verified = True if (
        billing['first_name'].lower().strip() == shipping['first_name'].lower().strip() and
        billing['last_name'].lower().strip(
        ) == shipping['last_name'].lower().strip()
    ) else False
    return verified


def verify_order_under_500(total):
    return True if float(total) < 500 else False


def log_order_status(order):
    print('BC order status: ', order['status'])
    log.info('BC order status: %s', order['status'])


def send_email(webServiceResponse):
    username = 'heattransferclothingalerts@gmail.com'
    password = '22Pixie@'
    smtpserver = smtplib.SMTP('smtp.gmail.com:587')
    smtpserver.ehlo()
    smtpserver.starttls()
    smtpserver.ehlo()
    smtpserver.login(username, password)
    fromaddr = 'heattransferclothingalerts@gmail.com'
    recipients = 'tre@heattransferwarehouse.com, ashleigh@heattransferwarehouse.com, tricia@heattransferwarehouse.com'
    responseDict = webServiceResponse['response']
    if (webServiceResponse['message'].find('Quantity is not in stock') > -1):
        subject = '[HTC] Order #' + \
            str(responseDict['poNum']) + ' Out of Stock Alert!'
        body = 'The following products triggered an out of stock warning: \n'
        errors = list(
            filter(lambda x: x['errorOccured'], responseDict['webServicePoDetailList']))
        for line in errors:
            body += 'SKU: ' + str(line['inventoryKey']) + str(
                line['sizeIndex']) + ', quantity ordered: ' + str(line['quantity']) + ' \n'
    elif (webServiceResponse['message'].lower().find('vinyl') > -1):
        subject = '[HTC] Order #' + \
            str(responseDict['poNum']) + ' Vinyl Products'
        body = webServiceResponse['message']
    else:
        subject = '[HTC] Order #' + str(responseDict['poNum']) + ' Error!'
        body = webServiceResponse['message']

    header = 'To:' + recipients + '\n' + 'From: ' + \
        fromaddr + '\n' + 'Subject:' + subject + ' \n'
    msg = header + '\n' + body + '\n\n'
    smtpserver.sendmail(fromaddr, recipients.split(', '), msg)
    smtpserver.close()


def formatStreetAddress(street):
    street = re.sub(' [Ss][Tt](reet)*.*', ' ST', street)
    street = re.sub(' [Aa][Vv][Ee].*(nue)*', ' AVE', street)
    street = re.sub(' [Dd][Rr](ive)*.*', ' RD', street)
    street = re.sub(' [Dd][Rr](ive)*.*', ' DR', street)
    street = re.sub(' [Bb](ou)*[Ll]e*[Vv](ar)*[Dd].*', ' BLVD', street)
    return street


def order_contains_warehouse_products(products):
    # Siser, ThermoFlex, WALAKut
    htw_brands = [63, 64, 65]
    return len([p for p in products if p['brand_id'] in htw_brands]) > 0


def remove_warehouse_products(products):
    # Siser, ThermoFlex, WALAKut
    htw_brands = [63, 64, 65]
    return [p for p in products if p['brand_id'] not in htw_brands]


def build_web_service_po(bc_order, shipping_address):
    attention = '%s %s' % (
        shipping_address['first_name'], shipping_address['last_name'])
    po_num = bc_order.id
    shipTo = (shipping_address['company'], attention)[
        shipping_address['company'] == '']
    shipAddress1 = formatStreetAddress(shipping_address['street_1'])
    shipAddress2 = shipping_address['street_2']
    shipCity = shipping_address['city']
    shipState = parse_state(shipping_address['state'])
    shipZip = shipping_address['zip']
    shipMethod = parse_shipping_method(
        str(shipping_address['shipping_method']).lower())
    shipEmail = 'tre@heattransferwarehouse.com'
    residence = 'N'

    webServicePODetailList = list()
    for p in bc_order['products']:
        sku = p['sku']
        print('adding product', str(
            sku[0:len(sku)-1]) + str(sku[len(sku)-1]), '...')
        log.info('adding product %s...', str(
            sku[0:len(sku)-1]) + str(sku[len(sku)-1]))
        webServicePODetail = factory.webServicePODetail(
            inventoryKey=sku[0:len(sku)-1],
            sizeIndex=sku[len(sku)-1],
            quantity=p['quantity']
        )
        webServicePODetailList.append(webServicePODetail)

    return factory.webServicePO(
        attention=attention[:35],
        poNum=po_num,
        residence=residence,
        shipAddress1=shipAddress1[:35],
        shipAddress2=shipAddress2[:35],
        shipCity=shipCity[:28],
        shipState=shipState[:2],
        shipZip=shipZip[:10],
        shipTo=shipTo[:28],
        shipMethod=shipMethod,
        shipEmail=shipEmail[:36],
        webServicePoDetailList=webServicePODetailList
    )


def preflight_check(webServicePO, webServiceUser):
    return client.service.getPreSubmitInfo(webServicePO, webServiceUser)


def submitPO(webServicePO, webServiceUser):
    print('submitting order', webServicePO.poNum, '...')
    log.info('submitting order %s...', webServicePO.poNum)
    po_results = client.service.submitPO(webServicePO, webServiceUser)
    log.info(str(po_results))
    return po_results


def validate_order(order, shipping_address):
    order_has_staff_notes = len(order['staff_notes']) > 0
    order_under_500 = verify_order_under_500(order['total_ex_tax'])
    order_address_match = verify_order_address(
        order['billing_address'], shipping_address)
    order_seems_ok = order_under_500 and order_address_match
    return order_has_staff_notes or order_seems_ok


def send_to_sanmar(webServicePO, order_contains_vinyl):
    check_results = preflight_check(webServicePO, webServiceUser)
    if(check_results['errorOccurred']):
        send_email(check_results)
    po_results = submitPO(webServicePO, webServiceUser)
    if(po_results['errorOccurred']):
        update_result = bc.update_order_status(
            webServicePO.poNum, ORDER_STATUS_MANUAL_VERIFICATION_REQUIRED, po_results['message'])
        log.info(str(update_result))
        send_email(po_results)
        return
    update_result = bc.update_order_status(
        webServicePO.poNum, ORDER_STATUS_AWAITING_SHIPMENT, po_results['message'])
    log.info(str(update_result))
    if order_contains_vinyl:
        po_results['message'] = 'Head\'s up! This order contains vinyl products.'
        send_email(po_results)


def flag_order(order, shipping_address):
    flags = []
    if not verify_order_under_500(order['total_ex_tax']):
        flags.append('Order total over $500')
    if not verify_order_address(order['billing_address'], shipping_address):
        flags.append('Address mismatch')
    update_result = bc.update_order_status(
        order.id, ORDER_STATUS_MANUAL_VERIFICATION_REQUIRED, ", ".join(flags))
    log.info(str(update_result))


def process_order(order):
    shipping_address = bc.get_order_shipping_address(order.id)
    if validate_order(order, shipping_address):
        products = bc.get_order_products(order.id)
        order_contains_vinyl = order_contains_warehouse_products(products)
        order['products'] = remove_warehouse_products(products)
        if len(order['products']) == 0:
            return
        webServicePO = build_web_service_po(order, shipping_address)
        send_to_sanmar(webServicePO, order_contains_vinyl)
    else:
        flag_order(order, shipping_address)


def main():
    orders = bc.get_recent_orders()
    log.info('found %s orders' % len(orders))
    for order in orders:
        process_order(order)


if __name__ == "__main__":
    main()
