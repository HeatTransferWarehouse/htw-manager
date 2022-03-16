import { Importer, ImporterField } from 'react-csv-importer';
import React from "react";
import { useDispatch, useSelector } from 'react-redux';

// include the widget CSS file whichever way your bundler supports it
import 'react-csv-importer/dist/index.css';

function Main () {

const dispatch = useDispatch();
const SanmarItems = useSelector(store => store.item.clothingtemplist);

async function calculateSales (products) {

    dispatch({
      type: "SET_CLOTHING",
      payload: {
        products: products,
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

        dispatch({
          type: "REFRESH_SANMAR", 
          payload: {
            products: SanmarItems,
          }
        })
      }}
      onClose={() => {
        // optional, invoked when import is done and user clicked "Finish"
        // (if this is not specified, the widget lets the user upload another file)
        console.log("importer dismissed");
      }}
    >
      <ImporterField name="name" label="PRODUCT_TITLE" />
      <ImporterField name="sku" label="UNIQUE_KEY" />
      <ImporterField name="color" label="COLOR_NAME" />
      <ImporterField name="size" label="SIZE" />
      <ImporterField name="price" label="PIECE_PRICE" />
    </Importer>

    )
}

export default Main;