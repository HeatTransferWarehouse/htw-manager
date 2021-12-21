import { Importer, ImporterField } from 'react-csv-importer';
import React from "react";
import { useDispatch } from 'react-redux';

// include the widget CSS file whichever way your bundler supports it
import 'react-csv-importer/dist/index.css';

function Main () {

const dispatch = useDispatch();

const calculateSales = (products) => {
    let types = [];
    let lengths = [];
    let widths = [];
    let colors = [];
    let newProducts = [];


    for (const prod of products) {
        let name = prod.name;
        let sku = prod.sku;
        let sales = prod.items;

      if (name.includes('Easyweed') === true || name.includes('EasyWeed') === true || name.includes('EASYWEED') === true) {
            types.push({product: name, sales: sales, sku: sku, type: 'EasyWeed'})
      } else if (name.includes('Thermoflex') === true || name.includes('ThermoFlex') === true || name.includes('THERMOFLEX') === true || name.includes('Turbo Low') === true) {
            types.push({product: name, sales: sales, sku: sku, type: 'Thermoflex'})
      } else {
            types.push({product: name, sales: sales, sku: sku, type: 'Uncategorized'})
      }
    }


    for (const prod of types) {

        if (prod.product.includes('10 Yard') === true && prod.type === 'Thermoflex') {
            lengths.push({divider: 3, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('20 Yard') === true && prod.type === 'Thermoflex') {
            lengths.push({divider: 1.5, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('12 Yard') === true && prod.type === 'Thermoflex') {
            lengths.push({divider: 2.5, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('15 Yard') === true && prod.type === 'Thermoflex') {
            lengths.push({divider: 2, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('5 Yard') === true && prod.type === 'Thermoflex') {
            lengths.push({divider: 6, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('3 Foot') === true && prod.type === 'Thermoflex') {
            lengths.push({divider: 30, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('12 Inch') === true || prod.product.includes('12x12') === true && prod.type === 'Thermoflex') {
            lengths.push({divider: 30, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('25 Yard') === true) {
            lengths.push({divider: 2, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('1 Yard') === true) {
            lengths.push({divider: 50, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('10 Yard') === true) {
            lengths.push({divider: 5, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('5 Yard') === true) {
            lengths.push({divider: 10, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('50 Yard') === true) {
            lengths.push({divider: 1, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('12 Inch') === true) {
            lengths.push({divider: 150, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else if (prod.product.includes('3 Foot') === true) {
            lengths.push({divider: 50, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        } else {
            lengths.push({divider: 50, product: prod.product, sales: prod.sales, sku: prod.sku, type: prod.type})
        }
    }

    for (const prod of lengths) {
      if (prod.sku.includes('12-') === true) {
        widths.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: '12"', type: prod.type})
      } else if (prod.sku.includes('15-') === true) {
        widths.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: '15"', type: prod.type})
      } else if (prod.sku.includes('20-') === true) {
        widths.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: '20"', type: prod.type})
      } else if (prod.sku.includes('10-') === true) {
        widths.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: '10"', type: prod.type})
      } else {
        widths.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: 'Not Found', type: prod.type})
      }
    }
  
    for (const prod of widths) {
      if (prod.product.includes('Matte White') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Matte White'})
      } else if (prod.product.includes('White Length') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'White Length'})
      } else if (prod.product.includes('Charcoal Gray') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Charcoal Gray'})
      } else if (prod.product.includes('Storm Grey') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Storm Grey'})
      } else if (prod.product.includes('Fluorescent Blue') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Fluorescent Blue'})
      } else if (prod.product.includes('Fluorescent Green') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Fluorescent Green'})
      } else if (prod.product.includes('Burgundy') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Burgundy'})
      } else if (prod.product.includes('Royal Blue') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Royal Blue'})
      } else if (prod.product.includes('Antique Gold') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Antique Gold'})
      } else if (prod.product.includes('Athletic Gold') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Athletic Gold'})
      } else if (prod.product.includes('Orange') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Orange'})
      } else if (prod.product.includes('Royal Purple') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Royal Purple'})
      } else if (prod.product.includes('White') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'White'})
      } else if (prod.product.includes('Kelly Green') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Kelly Green'})
      } else if (prod.product.includes('Black Stretch') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Black Stretch'})
      } else if (prod.product.includes('Black') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Black'})
      } else if (prod.product.includes('Red') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Red'})
      } else if (prod.product.includes('Yellow') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Yellow'})
      } else if (prod.product.includes('Purple') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Purple'})
      } else if (prod.product.includes('Gray') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Gray'})
      } else if (prod.product.includes('Silver') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Silver'})
      } else if (prod.product.includes('Gold') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Gold'})
      } else if (prod.product.includes('Pink') === true) {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Pink'})
      } else {
            colors.push({divider: prod.divider, product: prod.product, sales: prod.sales, sku: prod.sku, width: prod.width, type: prod.type, color: 'Uncategorized'})
      }
    }

    for (const prod of colors) {
        let bulk = Number(prod.sales) / prod.divider;
        let newBulk = Math.round(bulk);
        newProducts.push({bulk: newBulk, name: prod.product, sku: prod.sku, width: prod.width, type: prod.type, color: prod.color, sales: prod.sales});
    }

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