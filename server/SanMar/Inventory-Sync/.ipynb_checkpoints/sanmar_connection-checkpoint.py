import zeep
import os
import pandas as pd

wsdl = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort?wsdl'
cwd_path = os.getcwd()


class Sanmar():
    def __init__(self):
        self.client = zeep.Client(wsdl=wsdl)
        self.customer_number = '175733'
        self.customer_username = 'htw2014'
        self.customer_password = 'Htw$2014'
        color_map_path = '%s/unique_key-mainframe_color-map.csv' % cwd_path
        self.color_map = pd.read_csv(color_map_path, dtype={
                                     'UNIQUE_KEY': str, 'SANMAR_MAINFRAME_COLOR': str}, header=0)

    def get_mainframe_color(self, sku):
        df = self.color_map[self.color_map['UNIQUE_KEY'] == sku]
        if len(df) == 0:
            return None
        return df['SANMAR_MAINFRAME_COLOR'].values[0]

    def getInventoryQtyForStyleColorSize(self, parent_sku, color, size):
        return self.client.service.getInventoryQtyForStyleColorSize(self.customer_number, self.customer_username, self.customer_password, parent_sku, color, size)

    def getPreSubmitInfo(self, webServicePO, webServiceUser):
        return self.client.service.getPreSubmitInfo(webServicePO, webServiceUser)

    def submitPO(self, webServicePO, webServiceUser):
        return self.client.service.submitPO(webServicePO, webServiceUser)
