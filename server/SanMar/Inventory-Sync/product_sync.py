from bc_connection import BC
import pandas as pd
import os

bc = BC()
cwd_path = os.getcwd()


def get_sanmar_df():
    try:
        sanmar_df = pd.read_csv('%s/../data/SanMar_EPDD.csv' %
                                cwd_path, dtype={'STYLE#': str}, header=0)
        sanmar_df = sanmar_df.drop_duplicates('UNIQUE_KEY')
        required_columns = ('STYLE#', 'PRODUCT_TITLE', 'MILL')
        for c in sanmar_df.columns:
            if c not in required_columns:
                sanmar_df = sanmar_df.drop(c, axis=1)
                return sanmar_df
    except Exception as e:
        print(str(e))
        return None


def filter_brand_styles(sanmar):
    brands = list(map(lambda x: x['name'], bc.get_brands()))
    return set([r['STYLE#'] for (i, r) in df.iterrows() if r['MILL'] in brands])


def filter_new_products_from_df(bc_skus, df):
    unique_styles = filter_brand_styles(df)
    return set([s for s in unique_styles if s not in bc_skus])


def filter_old_products_from_bc(bc_skus, df):
    unique_styles = filter_brand_styles(df)
    return set([s for s in bc_skus if s not in unique_styles])


if __name__ == "__main__":
    df = get_sanmar_df()
    if df:
        bc_products = bc.get_all_products()
        bc_skus = tuple(map(lambda x: x.sku, bc_products))
        not_in_bc = filter_new_products_from_df(bc_skus, df)
        remove_from_bc = filter_old_products_from_bc(bc_skus, df)
