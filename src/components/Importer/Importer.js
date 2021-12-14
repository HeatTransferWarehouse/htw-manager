import { Importer, ImporterField } from 'react-csv-importer';
import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';

// include the widget CSS file whichever way your bundler supports it
import 'react-csv-importer/dist/index.css';

function Main () {

const dispatch = useDispatch();

const calculateSales = (products) => {
    let widths = [];
    let types = [];
    let newProducts = [];
    for (const prod of products) {
        let name = prod.name;
        let sku = prod.sku;
        let sales = prod.sales;
        let amount = prod.items;

        if (name.includes('5 Yard') === true) {
            widths.push({divider: 10, product: name, sales: sales, sku: sku, width: '5 Yard'})
        }

        if (name.includes('1 Yard') === true) {
            widths.push({divider: 50, product: name, sales: sales, sku: sku, width: '1 Yard'})
        }

        if (name.includes('10 Yard') === true) {
            widths.push({divider: 5, product: name, sales: sales, sku: sku, width: '10 Yard'})
        }

        if (name.includes('25 Yard') === true) {
            widths.push({divider: 2, product: name, sales: sales, sku: sku, width: '25 Yard'})
        }

        if (name.includes('50 Yard') === true) {
            widths.push({divider: 1, product: name, sales: sales, sku: sku, width: '50 Yard'})
        }

        if (name.includes('12 Inch') === true) {
            widths.push({divider: 150, product: name, sales: sales, sku: sku, width: '12 Inch'})
        }

        if (name.includes('3 Foot') === true) {
            widths.push({divider: 50, product: name, sales: sales, sku: sku, width: '3 Foot'})
        }

    }

    for (const prod of widths) {
      if (prod.product.includes('Easyweed') === true || prod.product.includes('EasyWeed') === true) {
            types.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: 'EasyWeed'})
      } else if (prod.product.includes('Thermoflex') === true) {
            types.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: 'Thermoflex'})
      } else {
            types.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: 'Uncategorized'})
      }
    }

    for (const prod of types) {
        let bulk = parseInt(prod.sales) / prod.divider;
        newProducts.push({bulk: bulk, name: prod.product, sku: prod.sku, width: prod.width, type: prod.type});
    }

    console.log(newProducts);

    dispatch({
      type: "ADD_ITEM",
      payload: {
        products: newProducts,
      }
    });
}

return (

<Importer
      chunkSize={10000} // optional, internal parsing chunk size in bytes
      assumeNoHeaders={false} // optional, keeps "data has headers" checkbox off by default
      restartable={true} // optional, lets user choose to upload another file when import is complete
      onStart={({ file, fields }) => {
        // optional, invoked when user has mapped columns and started import

        console.log("starting import of file", file, "with fields", fields);
      }}
      processChunk={async (rows) => {
        // required, receives a list of parsed objects based on defined fields and user column mapping;
        // may be called several times if file is large
        // (if this callback returns a promise, the widget will wait for it before parsing more data)
        console.log("received batch of rows", rows);

        calculateSales(rows);

        // mock timeout to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 500));
      }}
      onComplete={({ file, fields }) => {
        // optional, invoked right after import is done (but user did not dismiss/reset the widget yet)
        console.log("finished import of file", file, "with fields", fields);
      }}
      onClose={() => {
        // optional, invoked when import is done and user clicked "Finish"
        // (if this is not specified, the widget lets the user upload another file)
        console.log("importer dismissed");
      }}
    >
      <ImporterField name="name" label="Item Name" />
      <ImporterField name="sku" label="SKU" />
      <ImporterField name="items" label="# Items" />
      <ImporterField name="sales" label="# Sales" />
    </Importer>

    )
}

export default Main;