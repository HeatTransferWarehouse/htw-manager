import { Importer, ImporterField } from 'react-csv-importer';
import React from "react";
import { useDispatch } from 'react-redux';

// include the widget CSS file whichever way your bundler supports it
import 'react-csv-importer/dist/index.css';

function Main () {

const dispatch = useDispatch();

async function calculateSales (products) {
  let newProducts = [];

  for (const prod of products) {
    let preNewName = prod.name.replace(/™/g, "");
    let newName = preNewName.replace(/®/g, "");
    if (prod.type === 'Product' && (prod.brand === 'Ogio' || prod.brand === 'Gildan' || prod.brand === 'Cornerstone' || prod.brand === 'Carhartt' || prod.brand === 'Bulwark' || prod.brand === 'Anvil' || prod.brand === 'Hanes' || prod.brand === 'District' || prod.brand === 'District Made' || prod.brand === 'Eddie Bauer' || prod.brand === 'TravisMathew' || prod.brand === 'Sport-Tek' || prod.brand === 'Silly Socks' || prod.brand === 'Russell Outdoors' || prod.brand === 'Red Kap' || prod.brand === 'Red House' || prod.brand === 'Rabbit Skins' || prod.brand === 'Port Authority' || prod.brand === 'Port & Company' || prod.brand === 'Nike' || prod.brand === 'Next Level' || prod.brand === 'New Era' || prod.brand === 'Fruit of the Loom' || prod.brand === 'Jerzees' || prod.brand === 'Comfort Colors' || prod.brand === 'Champion' || prod.brand === 'Bella + Canvas' || prod.brand === 'Jerzees' || prod.brand === 'Alternative Apparel' || prod.brand === 'American Apparel')) {
      newProducts.push({sku: prod.sku, name: newName});
    }
  }

    dispatch({
      type: "SET_BC_CLOTHING",
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

        await calculateSales(rows);

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
      <ImporterField name="name" label="Product Name" />
      <ImporterField name="type" label="Item Type" />
      <ImporterField name="sku" label="Product ID" />
      <ImporterField name="brand" label="Brand Name" />
    </Importer>

    )
}

export default Main;