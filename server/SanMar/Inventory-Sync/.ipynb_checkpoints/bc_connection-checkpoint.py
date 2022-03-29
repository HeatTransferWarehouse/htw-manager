import bigcommerce
import re


class BC():
    def __init__(self):
        self.api = bigcommerce.api.BigcommerceApi(
            client_id='tw2come9pccgmcr0ybk555jkqcceiih', store_hash='et4qthkygq', access_token='13n6uxj2je2wbnc0vggmz8sqjl93d1d')
        self.cats = self.api.Categories.all(limit=250, is_visible=True)
        self.mens_cat_id = 42
        self.womens_cat_id = 52

    def get_product(self, id):
        return self.api.Products.get(id)

    def get_all_products(self, last_id=0):
        products = self.api.Products.all(min_id=last_id, limit=250)
        while len(products) % 250 == 0:
            last_id = products[-1].id
            products += self.api.Products.all(min_id=last_id, limit=250)
            print('%s products...' % len(products))
        return products

    def get_product_skus(self, id):
        skus = self.api.ProductSkus.all(parentid=id, limit=250)
        while len(skus) % 250 == 0:
            last_id = skus[-1]['id']
            skus += self.api.ProductSkus.all(parentid=id,
                                             limit=250, min_id=last_id)
        return skus if type(skus) == list else []

    def get_product_options(self, id):
        return self.api.ProductOptions.all(parentid=id)

    def get_option_values(self, id):
        return self.api.OptionValues.all(id, limit=250)

    def get_products_zero_inventory(self):
        last_id = 0
        running_total = 0
        products = self.api.Products.all(limit=250, min_id=last_id)
        zeroes = [p for p in products if p.inventory_level == 0]
        while len(products) % 250 == 0:
            last_id = products[-1]['id']
            products = self.api.Products.all(limit=250, min_id=last_id)
            running_total += len(products)
            zeroes += [p for p in products if p.inventory_level == 0]
        return zeroes

    def get_mens_categories(self):
        cat_id = self.mens_cat_id
        return [c for c in self.cats if c.id == cat_id or c.parent_id == cat_id]

    def get_womens_categories(self):
        cat_id = self.womens_cat_id
        return [c for c in self.cats if c.id == cat_id or c.parent_id == cat_id]

    def get_other_categories(self):
        cat_ids = (self.mens_cat_id, self.womens_cat_id)
        return [c for c in self.cats if c.id not in cat_ids and c.parent_id not in cat_ids]

    def get_category_products(self, id):
        products = self.api.Products.all(category=id, limit=250)
        while len(products) % 250 == 0:
            last_id = products[-1]['id']
            products += self.api.Products.all(category=id,
                                              limit=250, min_id=last_id)
        return products

    def get_brands(self):
        brands = self.api.Brands.all(limit=250)
        brands = brands if type(brands) == list else []
        htw_brands = ['Siser', 'ThermoFlex', 'WALAKut']
        return [b for b in brands if b.name not in htw_brands]

    def update_order_status(self, current_po, order_status, notes=''):
        return self.api.Orders.get(current_po).update(status_id=order_status, staff_notes=notes)

    def get_order_products(self, order_id):
        orderProducts = self.api.OrderProducts.all(order_id, limit=250)
        for op in orderProducts:
            p = self.api.Products.get(op['product_id'])
            if re.search(r'\d+$', p.brand['resource']):
                op['brand_id'] = int(
                    re.search(r'\d+$', p.brand['resource']).group(0))
        return orderProducts

    def get_order_shipping_address(self, order_id):
        return self.api.OrderShippingAddresses.all(order_id)[0]

    def get_recent_orders(self):
        order_list = []
        ap_orders = self.api.Orders.all(status_id=7)
        af_orders = self.api.Orders.all(status_id=11)
        if type(ap_orders) is list:
            order_list += ap_orders
        if type(af_orders) is list:
            order_list += af_orders
        return order_list
