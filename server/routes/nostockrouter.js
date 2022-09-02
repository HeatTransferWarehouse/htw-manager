const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");
var lupus = require('lupus');
const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

let config = {
  //authenticate Big Commerce API
  headers: {
    "X-Auth-Client": process.env.BG_AUTH_CLIENT,
    "X-Auth-Token": process.env.BG_AUTH_TOKEN,
  },
  // body: {
  //   "is_condition_shown": true
  // }
};


let slackNotify = false;
let stockNotify = false;
let resetNoStock = false;
let getSinglePage = false;
let stockNotifyTest = false;
let update = false;
let pageToUse = 0;

const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

const conversationId = "C02EV4JKSLA";

// Handle errors (see `errorCodes` export)
slackEvents.on('error', logtail.error);


//Waiter Function
function timeoutPromise(interval) {
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          resolve("done");
        }, interval);
      });
};


//Get All BC Items Function
async function getBCItems () {

  logtail.info('--NSN-- Getting Products..');

    let bcResponse1;
    let bcResponse2;
    let bcResponse3;
    let bcResponse4;
    let bcResponse5;
    let bcResponse6;
    let bcResponse7;
    let bcResponse8;
    let bcResponse9;
    let bcResponse10;
    let bcResponse11;
    let bcResponse12;
    let bcResponse13;
    let bcResponse14;
    let bcResponse15;
    let bcResponse16;
    let bcResponse17;
    let bcResponse18;
    let bcResponse19;
    let bcResponse20;
    let bcResponse21;
    let bcResponse22;
    let bcResponse23;
    let bcResponse24;
    let bcResponse25;
    let bcResponse26;
    let bcResponse27;
    let bcResponse28;
    let bcResponse = [];


    try {
      bcResponse1 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=1`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get1: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse2 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=2`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get2: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse3 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=3`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get3: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse4 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=4`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get4: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse5 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=5`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get5: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse6 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=6`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get6: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse7 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=7`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get7: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse8 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=8`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get8: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse9 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=9`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get9: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse10 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=10`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get10: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse11 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=11`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get11: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse12 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=12`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get12: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse13 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=13`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get13: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse14 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=14`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get14: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse15 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=15`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get15: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse16 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=16`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get16: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse17 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=17`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get17: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse18 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=18`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get18: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse19 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=19`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get19: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse20 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=20`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get20: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse21 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=21`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get21: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse22 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=22`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get22: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse23 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=23`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get23: ', err);
    }

await timeoutPromise(500);
  
    try {
      bcResponse24 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=24`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get24: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse25 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=25`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get25: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse26 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=26`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get26: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse27 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=27`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get27: ', err);
    }

await timeoutPromise(500);

    try {
      bcResponse28 = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=28`,
          config
        )
    } catch (err) {
      logtail.error('Error on Get28: ', err);
    }

await timeoutPromise(500);

    try {
      for (item of bcResponse1.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse2.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse3.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse4.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse5.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse6.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse7.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse8.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse9.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse10.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse11.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse12.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse13.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse14.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse15.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse16.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse17.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse18.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse19.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse20.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse21.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse22.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse23.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse24.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse25.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse26.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse27.data.data) {
        bcResponse.push(item);
       }
      } catch (err) {
        logtail.error('Error on bcCreate: ', err);

      }

await timeoutPromise(500);

    try {
      for (item of bcResponse28.data.data) {
        bcResponse.push(item);
      }
    } catch (err) {
      logtail.error('Error on bcCreate: ', err);
    }

await timeoutPromise(200);

return bcResponse;
}

//Get All Brands
async function GetAllBrands () {

  logtail.info('--NSN-- Getting Brands..');

  let brands = []

  try {
    brands = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/brands`,
        config
      )
  } catch (err) {
    logtail.error('--NSN-- Error on Get Brands: ', err);
  }

  return brands.data.data;

}


//Get Single BC Page Funciton
async function getSingleBCPage(page) {
  
let bcResponse1;
let bcResponse = [];

  try {
    bcResponse1 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=${page}`,
        config
      )
  } catch (err) {
    logtail.error('--NSN-- Error on Get: ', err);
  }

  await timeoutPromise(1000);

    try {
        for (item of bcResponse1.data.data) {
          bcResponse.push(item);
        }
      } catch (err) {
        logtail.error('--NSN-- Error on bcCreate: ', err);
      }

  return bcResponse;
}


//Add Items to Slack Notify and Database
async function addItems(bcResponse, notify) {

    let bcItemId;
    let varItems = [];
    let getItems = [];
    let newItems = [];

    const brands = await GetAllBrands();

  try {
    const queryText = `select * from "no-stock" ORDER BY id DESC`;
    await pool
      .query(queryText)
      .then((getResult) => {
        getItems = getResult.rows;
      })
  } catch (err) {
    logtail.error('--NSN-- Error on getItems: ' + err);
  }

  await timeoutPromise(500);

  logtail.info('--NSN-- Checking Product Level..');
  //logtail.info('BigCommerce TEST: ', bcResponse[0]);
  //logtail.info('NSN Database TEST: ', getItems[0]);

  try {
    if (!getItems[0]) {
      logtail.info('--NSN-- Item DB Empty!');
      for (const bc of bcResponse) {
        let bcItemName = bc.name.replace(/"|`|'/g, ' ');
        bcItemId = bc.id;
        let bcItemSku = bc.sku;
        let bcItemInv = bc.inventory_level;
        let bcItemTrack = bc.inventory_tracking;
        let bcItemBrand = bc.brand_id;
        let bcItemType = bc.type;
        let brand = 'No Brand';

        if (bcItemType === 'physical') {

        const district = 'District';
        const portauth = 'Port Authority';
        const sporttek = 'Sport-Tek';
        const newera = 'New Era';
        const ade = 'Alternative Dodgeball Eco';
        const aec = 'Alternative';
        const ej = 'Eco-Jersey';
        const champ = 'Champion';
        const vo = 'Volunteer';
        const mm = 'MERCER+METTLE';
        const nv = 'Nike';
        const tm = 'TravisMathew';
        const gildan = 'Gildan';
        const cc = 'COMFORT COLORS';
        const ccc = 'Comfort Colors';
        const hanes = 'Hanes';
        const aa = 'American Apparel';
        const jer = 'JERZEES';
        const fotl = 'Fruit of the Loom';
        const anvil = 'Anvil';
        const bac = 'BELLA+CANVAS';
        const cs = 'CornerStone';
        const pac = 'Port & Company';
        const red = 'Red House';
        const rabbit = 'Rabbit Skins';
        const uni = 'Unisex';
        const rk = 'Red Kap';
        const ro = 'Russell Outdoors';
        const nl = 'Next Level';
        const am = 'Allmade';

        for (const b of brands) {
          if (b.id === bcItemBrand) {
            brand = b.name;
          }
        }

        if (bcItemInv === 0 && bcItemTrack !== 'variant' && bcItemName.includes(ccc) === false && bcItemName.includes(mm) === false && bcItemName.includes(vo) === false && bcItemName.includes(tm) === false && bcItemName.includes(am) === false && bcItemName.includes(nl) === false && bcItemName.includes(ro) === false && bcItemName.includes(rk) === false && bcItemName.includes(uni) === false && bcItemName.includes(rabbit) === false && bcItemName.includes(red) === false && bcItemName.includes(pac) === false && bcItemName.includes(cs) === false && bcItemName.includes(bac) === false && bcItemName.includes(anvil) === false && bcItemName.includes(fotl) === false && bcItemName.includes(jer) === false && bcItemName.includes(aa) === false && bcItemName.includes(hanes) === false && bcItemName.includes(cc) === false && bcItemName.includes(gildan) === false && bcItemName.includes(district) === false && bcItemName.includes(portauth) === false && bcItemName.includes(sporttek) === false && bcItemName.includes(newera) === false && bcItemName.includes(ade) === false && bcItemName.includes(aec) === false && bcItemName.includes(ej) === false && bcItemName.includes(champ) === false && bcItemName.includes(champ) === false && bcItemName.includes(nv) === false) {
          let product = {
            name: bcItemName,
            sku: bcItemSku,
            id: bcItemId,
            inventory_tracking: bcItemTrack,
            inventory_level: bcItemInv,
            brand: brand,
            level: 'Product'
          };
          newItems.push(product);
        }
       }
      }
    } else {
      for (const bc of bcResponse) {
        bcItemId = bc.id;
        let bcItemName = bc.name.replace(/"|`|'/g, ' ');
        let bcItemSku = bc.sku;
        let bcItemInv = bc.inventory_level;
        let bcItemTrack = bc.inventory_tracking;
        let bcItemBrand = bc.brand_id;
        let bcItemType = bc.type;
        let brand = 'No Brand';
        let canInsert = true;

        if (bcItemType === 'physical') {

        for (const item of getItems) {
          if (bcItemId === item.id) {
            canInsert = false;
          }
        }

        const district = 'District';
        const portauth = 'Port Authority';
        const sporttek = 'Sport-Tek';
        const newera = 'New Era';
        const ade = 'Alternative Dodgeball Eco';
        const aec = 'Alternative';
        const ej = 'Eco-Jersey';
        const champ = 'Champion';
        const vo = 'Volunteer';
        const mm = 'MERCER+METTLE';
        const nv = 'Nike';
        const gildan = 'Gildan';
        const cc = 'COMFORT COLORS';
        const ccc = 'Comfort Colors';
        const hanes = 'Hanes';
        const aa = 'American Apparel';
        const jer = 'JERZEES';
        const tm = 'TravisMathew';
        const fotl = 'Fruit of the Loom';
        const anvil = 'Anvil';
        const bac = 'BELLA+CANVAS';
        const cs = 'CornerStone';
        const pac = 'Port & Company';
        const red = 'Red House';
        const rabbit = 'Rabbit Skins';
        const uni = 'Unisex';
        const rk = 'Red Kap';
        const ro = 'Russell Outdoors';
        const nl = 'Next Level';
        const am = 'Allmade';

        for (const b of brands) {
          if (b.id === bcItemBrand) {
            brand = b.name;
          }
        }

        if (canInsert === true && bcItemInv === 0 && bcItemTrack !== 'variant' && bcItemName.includes(ccc) === false && bcItemName.includes(mm) === false && bcItemName.includes(vo) === false && bcItemName.includes(tm) === false && bcItemName.includes(am) === false && bcItemName.includes(nl) === false && bcItemName.includes(ro) === false && bcItemName.includes(rk) === false && bcItemName.includes(uni) === false && bcItemName.includes(rabbit) === false && bcItemName.includes(red) === false && bcItemName.includes(pac) === false && bcItemName.includes(cs) === false && bcItemName.includes(bac) === false && bcItemName.includes(anvil) === false && bcItemName.includes(fotl) === false && bcItemName.includes(jer) === false && bcItemName.includes(aa) === false && bcItemName.includes(hanes) === false && bcItemName.includes(cc) === false && bcItemName.includes(gildan) === false && bcItemName.includes(district) === false && bcItemName.includes(portauth) === false && bcItemName.includes(sporttek) === false && bcItemName.includes(newera) === false && bcItemName.includes(ade) === false && bcItemName.includes(aec) === false && bcItemName.includes(ej) === false && bcItemName.includes(champ) === false && bcItemName.includes(champ) === false && bcItemName.includes(nv) === false) {
          let product = {
            name: bcItemName,
            sku: bcItemSku,
            id: bcItemId,
            inventory_tracking: bcItemTrack,
            inventory_level: bcItemInv,
            brand: brand,
            level: 'Product'
          };
          newItems.push(product);
        }
       }
      }
    }

  } catch (err) {
    logtail.error('--NSN-- Error on productMsg: ', err);
  }

  await timeoutPromise(500);

  try {
    varItems = await getVars(bcResponse);
  } catch (err) {
    logtail.error('--NSN-- Error on getVars: ', err);
  }

  //logtail.info('Variants TEST: ', varItems);

  logtail.info('--NSN-- Checking Variant Level..');

  try {

    if (!getItems[0]) {
      //logtail.info('Item DB Empty!');
      for (const v of varItems) {

        if (v.inventory_level === 0) {

          let bcItemBrand = v.brandId;
          let brand = 'No Brand';

          for (const b of brands) {
            if (b.id === bcItemBrand) {
              brand = b.name;
            }
          }

          let bcItemName = v.name;
          let bcItemSku = v.sku;
          bcItemId = v.id;
          let variant = {
            name: bcItemName,
            sku: bcItemSku,
            id: bcItemId,
            inventory_tracking: v.inventory_tracking,
            inventory_level: v.inventory_level,
            brand: brand,
            level: 'Variant',
          };
          newItems.push(variant);
        } else {
          //logtail.error('Variant not at 0 stock!');
        }
      }
    } else {

      for (const v of varItems) {
        bcItemId = v.id;
        let canInsert = true;

        for (const item of getItems) {
          if (bcItemId === item.id) {
            canInsert = false;
          }
        }

        if (v.inventory_level === 0 && canInsert === true) {

          let bcItemBrand = v.brandId;
          let brand = 'No Brand';

          for (const b of brands) {
            if (b.id === bcItemBrand) {
              brand = b.name;
            }
          }

          let bcItemSku = v.sku;
          bcItemId = v.id;
          let bcItemName = v.name;
          let variant = {
            name: bcItemName,
            sku: bcItemSku,
            id: bcItemId,
            inventory_tracking: v.inventory_tracking,
            inventory_level: v.inventory_level,
            brand: brand,
            level: 'Variant',
          };
          newItems.push(variant);
        } else {
          //logtail.error('Variant not at 0 stock!');
        }
      }
    }
  } catch (err) {
    logtail.error('--NSN-- Error on varMsg: ', err);
  }

  await timeoutPromise(500);

  //logtail.info('New Items TEST: ', newItems);

if (newItems[0]) {
 for (const item of newItems) {
  try {
      const queryText = `INSERT INTO "no-stock" (name, sku, inventory_level, id, level, brand) VALUES ($1, $2, $3, $4, $5, $6);`;
      await pool
        .query(queryText, [item.name, item.sku, item.inventory_level, item.id, item.level, item.brand])
  } catch (err) {
    logtail.error('SKU: ', item.sku + 'ID: ', item.id + ' Error on insert: ', err);
  }
 }
} else {
 logtail.info('--NSN-- No new items!');
}

  await timeoutPromise(500);

  try {
    logtail.info("We are about to get the item list");

    const queryText = `select * from "no-stock" ORDER BY id DESC`;
    await pool
      .query(queryText)
  } catch (err) {
    logtail.error('--NSN-- Error on getItems: ', err);
  }

if (notify) {

  try {
    if (!newItems[0]) {
      logtail.info('--NSN-- No Message Sent to slack!');
    } else {
      let slackText = `:warning: *NO STOCK NOTIFY!* :warning:\n\n<!channel>\n\nWALLY B FOUND SOME NEW PRODUCTS OUT OF STOCK!\n\n`;

      for (let i = 0; i < newItems.length; i++) {
        let itemTrack = newItems[i].inventory_tracking;
        if (itemTrack === 'none') {
          slackText += "*ITEM:* ```" + newItems[i].name + "``` has *Inventory Tracking* disabled! Enable Tracking *ASAP*!\n\n\n\n"
        } else if (newItems[i].sku) {
          slackText += "*ITEM:* ```" + newItems[i].name + "``` with *SKU:* ```" + newItems[i].sku + "``` is recently out of stock! Please look into this *ASAP*!\n\n\n\n"
        } else {
          slackText += "*ITEM:* ```" + newItems[i].name + "``` with *SKU:* ```" + "NO SKU or on the Product Level!" + "``` is recently out of stock! Please look into this *ASAP*!\n\n\n\n"
        }
      }

      (async () => {
        // See: https://api.slack.com/methods/chat.postMessage
        const res = await web.chat.postMessage({
          icon_emoji: ":warning:",
          channel: conversationId,
          text: `${slackText}`,
        });

        // `res` contains information about the posted message

        logtail.info("--NSN-- Slack Notify Message sent..");
      })();
    }
  } catch (err) {
    logtail.error('--NSN-- Error on slack message: ', err);
  }

} else {
  logtail.info('--NSN-- No Message Sent to slack!');
}
}


//Get Zero Stock Items & Notify
async function getItems(notify) {

    let bcResponse = [];

    try {
      bcResponse = await getBCItems();
    } catch (err) {
      logtail.error('--NSN-- Error on getBCItems: ', err);
    }

    await timeoutPromise(1000);

    addItems(bcResponse, notify);
}


//Get Zero Stock Items & Notify on Single Page
async function getItemsSinglePage(pageToUse) {

  let bcResponse = [];

  try {
    bcResponse = await getSingleBCPage(pageToUse);
  } catch (err) {
    logtail.error('--NSN-- Error on getBCItems: ', err);
  }

  await timeoutPromise(1000);

  addItems(bcResponse);
}


//Get All Variants of All Products
async function getVars(bcResponse) {

  logtail.info('--NSN-- Getting Variants..');

  let varItems = [];

    try {
      for (const bc of bcResponse) {
        if (bc.inventory_tracking === 'variant' && bc.type === 'physical') {
        let pusher = await eachVar(bc);
        if (pusher[0]) {
         for (const item of pusher) {

          const district = 'District';
          const portauth = 'Port Authority';
          const sporttek = 'Sport-Tek';
          const newera = 'New Era';
          const ade = 'Alternative Dodgeball Eco';
          const aec = 'Alternative';
          const ej = 'Eco-Jersey';
          const champ = 'Champion';
          const vo = 'Volunteer';
          const mm = 'MERCER+METTLE';
          const nv = 'Nike';
          const tm = 'TravisMathew';
          const gildan = 'Gildan';
          const cc = 'COMFORT COLORS';
          const ccc = 'Comfort Colors';
          const hanes = 'Hanes';
          const aa = 'American Apparel';
          const jer = 'JERZEES';
          const fotl = 'Fruit of the Loom';
          const anvil = 'Anvil';
          const bac = 'BELLA+CANVAS';
          const cs = 'CornerStone';
          const pac = 'Port & Company';
          const red = 'Red House';
          const rabbit = 'Rabbit Skins';
          const uni = 'Unisex';
          const rk = 'Red Kap';
          const ro = 'Russell Outdoors';
          const nl = 'Next Level';
          const am = 'Allmade';

          if (item.name.includes(am) === false && item.name.includes(ccc) === false && item.name.includes(mm) === false && item.name.includes(vo) === false && item.name.includes(tm) === false && item.name.includes(ro) === false && item.name.includes(nl) === false && item.name.includes(rk) === false && item.name.includes(uni) === false && item.name.includes(rabbit) === false && item.name.includes(red) === false && item.name.includes(pac) === false && item.name.includes(cs) === false && item.name.includes(bac) === false && item.name.includes(anvil) === false && item.name.includes(fotl) === false && item.name.includes(jer) === false && item.name.includes(aa) === false && item.name.includes(hanes) === false && item.name.includes(cc) === false && item.name.includes(gildan) === false && item.name.includes(district) === false && item.name.includes(portauth) === false && item.name.includes(sporttek) === false && item.name.includes(newera) === false && item.name.includes(ade) === false && item.name.includes(aec) === false && item.name.includes(ej) === false && item.name.includes(champ) === false && item.name.includes(champ) === false && item.name.includes(nv) === false) {
        
        let bcItemBrand = bc.brand_id;
        
         varItems.push({
          sku: item.sku,
          id: item.id,
          inventory_level: item.inventory_level,
          name: item.name,
          brandId: bcItemBrand,
          inventory_tracking: item.inventory_tracking,
        });
        //await timeoutPromise(5);
          }
         }
        }
       }
      }
    } catch (err) {
      logtail.error('--NSN-- Error on makeVarArray: ', err);
    }

    return varItems;
}


//Get Each Variant of a specific Product
async function eachVar(bc) {
  try {
    let bcItemId = bc.id;
    let bcItemTrack = bc.inventory_tracking;
    let bcItemName = bc.name.replace(/"|`|'/g, ' ');

    if (bcItemTrack === 'variant') {
      let getVar = [];

      getVar = await axios
        .get(
          `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${bcItemId}/variants`,
          config
        )

        let varToPush = [];

     if (getVar.data.data[0]) {

     for (const variant of getVar.data.data) {

      let varSku = variant.sku;
      let varId = variant.id;
      let varInv = variant.inventory_level;

      let pusher = {
        sku: varSku,
        id: varId,
        inventory_level: varInv,
        name: bcItemName,
        inventory_tracking: bcItemTrack,
      }

      varToPush.push(pusher);

      }

     }

     return varToPush;

    }
  } catch (err) {
    logtail.error('--NSN-- Error on getVar: ', err);
  }
}


//Update Products with body of the config
async function updateProducts(page) {

  let bcItems = [];

  bcItems = await getSingleBCPage(page);

  for (let i = 0 ; i < bcItems.length ; i++) {

     var data = "{\"is_condition_shown\":true}";

     var xhr = new XMLHttpRequest();
     xhr.withCredentials = true;

     xhr.addEventListener("readystatechange", function () {
       if (this.readyState === this.DONE) {
       }
     });

     xhr.open("PUT", `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${bcItems[i].id}`);
     xhr.setRequestHeader("accept", "application/json");
     xhr.setRequestHeader("x-auth-token", process.env.BG_AUTH_TOKEN);

     xhr.send(data);
     logtail.info('yUH');
  }
}


// Auto Update Product
setInterval(() => {
  // set this to true to activate
  update = false;

  if (update) {

    pageToUse++;
    if (pageToUse > 28) {
      pageToUse = 1;
    }
    logtail.info(`--NSN-- Updating Items on page ${pageToUse}..`);
    update = false;
    updateProducts(pageToUse);
  }
}, 1000 * 60 * 480);


// Auto Restock Notify
setInterval(() => {
  // set this to true to activate
  stockNotify = true;

  if (stockNotify) {
    logtail.info('--NSN-- Checking for Stocked Items..');
    stockNotify = false;
    checkItems();

  async function checkItems(req, res) {
      
  let bcResponse = [];
  let varItems = [];
  let getItems = [];
  let stockedItems = [];
  let bcItemId;

  try {
    bcResponse = await getBCItems();
  } catch (err) {
    logtail.error('--NSN-- Error on getBCItems: ', err);
  }

await timeoutPromise(500);

  try {
    const queryText = `select * from "no-stock" WHERE reason <> 'clothing' ORDER BY id DESC`;
    await pool
      .query(queryText)
      .then((getResult) => {
        getItems = getResult.rows;
      })
  } catch (err) {
    logtail.error('--NSN-- Error on getItems: ', err);
  }

await timeoutPromise(500);

logtail.info('--NSN-- Checking Product Level..');

      try {
        if (getItems[0]) {
          for (const bc of bcResponse) {
            bcItemId = bc.id;
            let bcItemSku = bc.sku;
            let bcItemInv = bc.inventory_level;
            for (const item of getItems) {
              let itemId = item.id;
              let itemSku = item.sku;
              if (bcItemId === itemId && bcItemSku === itemSku && bcItemInv !== 0) {
                let itemToPush = {
                  id: itemId,
                }
                stockedItems.push(itemToPush);
              }
            }
          }
        }
      } catch (err) {
        logtail.error('--NSN-- Error on getStocked: ', err);
      }

  await timeoutPromise(500);

  try {
  varItems = await getVars(bcResponse);
  } catch (err) {
    logtail.error('--NSN-- Error on getVars: ', err);
  }

logtail.info('--NSN-- Checking Variant Level..');

      try {
        if (getItems[0]) {
          for (const v of varItems) {
            bcItemId = v.id;
            let bcItemSku = v.sku;
            let bcItemInv = v.inventory_level;
            for (const item of getItems) {
              let itemId = item.id;
              let itemSku = item.sku;
              if (bcItemId === itemId && bcItemSku === itemSku && bcItemInv !== 0) {
                let itemToPush = {
                  id: itemId,
                }
                stockedItems.push(itemToPush);
              }
            }
          }
        }
      } catch (err) {
        logtail.error('--NSN-- Error on get Var Stocked: ', err);
      }

  await timeoutPromise(500);

      if (stockedItems[0]) {
        logtail.info('--NSN-- Deleting Items..');
              try {
                for (item of stockedItems) {
                  logtail.info(item);
                  const queryText = `delete from "no-stock" WHERE id = '${item.id}'`;
                  await pool
                    .query(queryText)
                }
              } catch (err) {
                logtail.info('--NSN-- Error on delete: ', err);
              }
      } else {
        logtail.error('--NSN-- No Items to Delete..');
      }
    }
  }
}, 1000 * 60 * 47);


// Auto Restock Notify TEST
setInterval(() => {
  // set this to true to activate
  stockNotifyTest = false;

  if (stockNotifyTest) {
    logtail.info('--NSN-- Checking for Stocked Items.. (TEST)');
    stockNotify = false;
    checkItemsTest();

    async function checkItemsTest(req, res) {

      let bcResponse = [];
      let varItems = [];
      let getItems = [];
      let stockedItems = [];
      let bcItemId;

      try {
        bcResponse = await getBCItems();
      } catch (err) {
        logtail.info('--NSN-- Error on getBCItems: ', err);
      }

      await timeoutPromise(500);

      try {
        const queryText = `select * from "no-stock" WHERE reason <> 'clothing' ORDER BY id DESC`;
        await pool
          .query(queryText)
          .then((getResult) => {
            getItems = getResult.rows;
          })
      } catch (err) {
        logtail.info('--NSN-- Error on getItems: ', err);
      }

      await timeoutPromise(500);

      logtail.info('--NSN-- Checking Product Level..');

      try {
        if (getItems[0]) {
          for (const bc of bcResponse) {
            bcItemId = bc.id;
            let bcItemSku = bc.sku;
            let bcItemInv = bc.inventory_level;
            for (const item of getItems) {
              let itemId = item.id;
              let itemSku = item.sku;
              if (bcItemId === itemId && bcItemSku === itemSku && bcItemInv !== 0) {
                logtail.info(`BCId: ${bcItemId}, ItemId: ${itemId}`);
                logtail.info(`BCSku: ${bcItemSku}, ItemSku: ${itemSku}`);
                logtail.info('Stock: ', bcItemInv);
                let itemToPush = {
                  id: itemId,
                }
                stockedItems.push(itemToPush);
              }
            }
          }
        }

      } catch (err) {
        logtail.info('--NSN-- Error on getStocked: ', err);
      }

      await timeoutPromise(500);

      try {
        varItems = await getVars(bcResponse);
      } catch (err) {
        logtail.info('--NSN-- Error on getVars: ', err);
      }

      logtail.info('--NSN-- Checking Variant Level..');

      try {
        if (getItems[0]) {
          for (const v of varItems) {
            bcItemId = v.id;
            let bcItemSku = v.sku;
            let bcItemInv = v.inventory_level;
            for (const item of getItems) {
              let itemId = item.id;
              let itemSku = item.sku;
              if (bcItemId === itemId && bcItemSku === itemSku && bcItemInv !== 0) {
                logtail.info(`BCId: ${bcItemId}, ItemId: ${itemId}`);
                logtail.info(`BCSku: ${bcItemSku}, ItemSku: ${itemSku}`);
                logtail.info('Stock: ', bcItemInv);
                let itemToPush = {
                  id: itemId,
                }
                stockedItems.push(itemToPush);
              }
            }
          }
        }
      } catch (err) {
        logtail.info('--NSN-- Error on get Var Stocked: ', err);
      }

      await timeoutPromise(500);

      if (stockedItems[0]) {
        logtail.info('--NSN-- Deleting Items..');
        try {
          for (item of stockedItems) {
            logtail.info(item);
            const queryText = `delete from "no-stock" WHERE id = '${item.id}'`;
            await pool
              .query(queryText)
          }
        } catch (err) {
          logtail.info('--NSN-- Error on delete: ', err);
        }
      } else {
        logtail.info('--NSN-- No Items to Delete..');
      }

    }
  }
}, 1000 * 60 * 480);


// Auto Reset Database (Not Dead Inventory)
setInterval(() => {
  // set this to true to activate
  resetNoStock = false;

  if (resetNoStock) {
    logtail.info('--NSN-- Resetting Database..');
    resetNoStock = false;
    resetDb();

    async function resetDb(req, res) {

let bcResponse = [];
let msg = '';
let bcItemId;
let varItems = [];
let getItems = [];

  try {
    bcResponse = await getBCItems();
  } catch (err) {
    logtail.info('--NSN-- Error on getBCItems: ', err);
    return res.status(500).send();
  }

await timeoutPromise(1000);


try {
  const queryText = `DELETE from "no-stock" WHERE dead = false`;
  await pool
    .query(queryText)
    .then((deleteResult) => {
    })
} catch (err) {
  logtail.info('--NSN-- Error on deleteItems: ', err);
  return res.status(500).send();
}

await timeoutPromise(500);

try {
  const queryText = `select * from "no-stock" ORDER BY id DESC`;
  await pool
    .query(queryText)
    .then((getResult) => {
      getItems = getResult;
    })
} catch (err) {
  logtail.info('--NSN-- Error on getItems: ', err);
  return res.status(500).send();
}

await timeoutPromise(2000);

try {
  if (!getItems.rows[0]) {
    logtail.info('--NSN-- Item DB Empty!');
    for (let i = 0; i < bcResponse.length; i++) {
      let bcItemName = bcResponse[i].name.replace(/"|`|'/g, ' ');
      bcItemId = bcResponse[i].id;
      let bcItemSku = bcResponse[i].sku;
      let bcItemInv = bcResponse[i].inventory_level;
      //let bcItemTrack = bcResponse[i].inventory_tracking;

      if (bcItemInv === 0) {
        msg += (`('${bcItemName}', '${bcItemSku}', ${bcItemInv}, ${bcItemId}, 'Product'), `);
      }
    }
  } else {
    for (let i = 0; i < bcResponse.length; i++) {
      bcItemId = bcResponse[i].id;
      let bcItemName = bcResponse[i].name.replace(/"|`|'/g, ' ');
      let bcItemSku = bcResponse[i].sku;
      let bcItemInv = bcResponse[i].inventory_level;
      //let bcItemTrack = bcResponse[i].inventory_tracking;
      let canInsert = true;

      for (let j = 0; j < getItems.rows.length; j++) {
        if (bcItemId === getItems.rows[j].id) {
          canInsert = false;
        }
      }

      if (canInsert === true && bcItemInv === 0) {
        msg += (`('${bcItemName}', '${bcItemSku}', ${bcItemInv}, ${bcItemId}, 'Product'), `);
      }
    }
  }

} catch (err) {
  logtail.info('Error on productMsg: ', err);
  return res.status(500).send();
}

await timeoutPromise(10000);

try {
  lupus(0, bcResponse.length, async function getVariants(i) {
    bcItemId = bcResponse[i].id;
    let bcItemTrack = bcResponse[i].inventory_tracking;

    if (bcItemTrack === 'variant') {
    let getVar = [];

    getVar = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${bcItemId}/variants`,
        config
      )


    let bcItemName = bcResponse[i].name.replace(/"|`|'/g, ' ');
    let bcItemSku = bcResponse[i].sku;
    varItems = getVar.data.data;

    if (!getItems.rows[0]) {
      //logtail.info('Item DB Empty!');
      for (let k = 0; k < varItems.length; k++) {

        if (varItems[k].inventory_level === 0) {
          bcItemSku = varItems[k].sku;
          bcItemId = varItems[k].id;
          msg += (`('${bcItemName}', '${bcItemSku}', ${varItems[k].inventory_level}, ${bcItemId}, 'Variant'), `);
        } else {
          //logtail.info('Variant not at 0 stock!');
        }
      }
    } else {

      for (let k = 0; k < varItems.length; k++) {

        bcItemId = varItems[k].id;
        let canInsert = true;

        for (let j = 0; j < getItems.rows.length; j++) {
          if (bcItemId === getItems.rows[j].id) {
            canInsert = false;
          }
        }

        if (varItems[k].inventory_level === 0 && canInsert === true) {
          bcItemSku = varItems[k].sku;
          msg += (`('${bcItemName}', '${bcItemSku}', ${varItems[k].inventory_level}, ${bcItemId}, 'Variant'), `);
        } else {
          //logtail.info('Variant not at 0 stock!');
        }
      }
    }
   }
  })
} catch (err) {
  logtail.info('--NSN-- Error on varMsg: ', err);
  return res.status(500).send();
}

await timeoutPromise(12000);

try {
  if (msg === '') {
    logtail.info('--NSN-- No new items!');
  } else {

    let newMsg = msg.slice(0, -2);

    const queryText = `INSERT INTO "no-stock" (name, sku, inventory_level, id, level) VALUES ${newMsg};`;
    await pool
      .query(queryText)
  }
} catch (err) {
  logtail.info('Error on insert: ', err);
  return res.status(500).send();
}

await timeoutPromise(3000);

try {
  logtail.info("--NSN-- We are about to get the item list");

  const queryText = `select * from "no-stock" ORDER BY id DESC`;
  await pool
    .query(queryText)
    .then((selectResult) => {
      res.send(selectResult.rows);
    })
} catch (err) {
  logtail.info('--NSN-- Error on getItems: ', err);
  return res.status(500).send();
}


    }
  }
}, 1000 * 60 * 480);


// Auto No Stock Notify ALL PAGES
setInterval(() => {
  // set this to true to activate
  slackNotify = false;

  if (slackNotify) {
    logtail.info('--NSN-- running Slack Notify..');
    slackNotify = false;
    getItems(true);
 }
}, 1000 * 60 * 33);


// Auto No Stock Notify Single Page
setInterval(() => {
  // set this to true to activate
  getSinglePage = false;

  if (getSinglePage) {
    pageToUse++;
    if (pageToUse > 28) {
      pageToUse = 1;
    }
    logtail.info(`--NSN-- running Slack Notify on page ${pageToUse}..`);
    getSinglePage = false;
    getItemsSinglePage(pageToUse);
  }
}, 1000 * 60 * 480);

router.get("/items", function (req, res) {

  res.sendStatus(200);
  logtail.info('--NSN-- running MANUAL Slack Notify..');
  getItems(true);

});

router.get("/getitems", (req, res) => {
  logtail.info("--NSN-- We are about to get the NSN list");

  const queryText = `select * from "no-stock" ORDER BY id DESC`;
  pool
    .query(queryText)
    .then((selectResult) => {
      res.send(selectResult.rows);
    })
    .catch((error) => {
      logtail.error(`--NSN-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.delete("/items/:id", async function (req, res) {
  logtail.info("--NSN-- We are deleting NSN items as dead with id:", req.params.id);
  const ids = req.params.id;

  let items = [];
  let itemToPush = '';
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] !== ',') {
      itemToPush += (ids[i]);
    }
    if (ids[i] === ',') {
      items.push(itemToPush);
      itemToPush = '';
    }
  }
  items.push(itemToPush);
  itemToPush = '';
  
  try {
    for (const item of items) {
      const queryText = `delete from "no-stock" WHERE id = ${item}`;
      await pool
        .query(queryText)
    }
  } catch (err) {
    logtail.error('--NSN-- Error on delete: ', err);
    return res.status(500).send();
  }

  
  try {
    const queryText = `select * from "no-stock" ORDER BY id DESC`;
    await pool
      .query(queryText)
      .then((selectResult) => {
        res.send(selectResult.rows);
      })
      .catch((error) => {
        logtail.info(`--NSN-- Error on item query ${error}`);
        res.sendStatus(500);
      });
  } catch (err) {
    logtail.error('--NSN-- Error on Get: ', err);
    return res.status(500).send();
  }
 
    
});

router.put("/items/mark", async function (req, res) {
  logtail.info("--NSN-- We are updating NSN items as dead..");
  const items = req.body.items;
  const reason = req.body.reason;

  try {
    for (const item of items) {
      logtail.info('--NSN-- ', item);
    const queryText = `UPDATE "no-stock" SET dead = true WHERE id = ${item}`;
    await pool
      .query(queryText)
    }
  } catch (err) {
    logtail.info('--NSN-- Error on update: ', err);
    return res.status(500).send();
  }

  try {
    for (const item of items) {
      logtail.info('--NSN-- ', item, reason);
      const queryText = `UPDATE "no-stock" SET reason = '${reason}' WHERE id = ${item}`;
      await pool
        .query(queryText)
    }
  } catch (err) {
    logtail.info('--NSN-- Error on setReason: ', err);
    return res.status(500).send();
  }
  
  try {
    logtail.info("--NSN-- We are about to get the item list");

    const queryText = `select * from "no-stock" ORDER BY id DESC`;
    await pool
      .query(queryText)
      .then((selectResult) => {
        res.send(selectResult.rows);
      })
      .catch((error) => {
        logtail.info(`--NSN-- Error on item query ${error}`);
        res.sendStatus(500);
      });
  } catch (err) {
    logtail.info('--NSN-- Error on Get: ', err);
    return res.status(500).send();
  }
    
});

router.put("/items/notes", async function (req, res) {
  logtail.info("--NSN-- We are updating notes..");
  const items = req.body.items;
  const note = req.body.note;

  for (const item of items) {    
  try {
          const queryText = `UPDATE "no-stock" SET notes = '${note}' WHERE id = ${item}`;
          await pool
            .query(queryText)
      } catch (err) {
        logtail.info('Error on update: ', err);
        return res.status(500).send();
      }
    }

  try {
    logtail.info("--NSN-- We are about to get the item list");

    const queryText = `select * from "no-stock" ORDER BY id DESC`;
    await pool
      .query(queryText)
      .then((selectResult) => {
        res.send(selectResult.rows);
      })
      .catch((error) => {
        logtail.info(`--NSN-- Error on item query ${error}`);
        res.sendStatus(500);
      });
  } catch (err) {
    logtail.info('--NSN-- Error on Get: ', err);
    return res.status(500).send();
  }

});

router.put("/deadItems", async function (req, res) {
  logtail.info("--NSN-- We are updating NSN items as not dead");
  const items = req.body.items;

    try {
      for (const item of items) {
        logtail.info('--NSN-- ', item);
        const queryText = `UPDATE "no-stock" SET dead = false WHERE id = $1`;
        await pool
          .query(queryText, [item])
      }
    } catch (err) {
      logtail.info('--NSN-- Error on update: ', err);
      return res.status(500).send();
    }

    try {
      logtail.info("--NSN-- We are about to get the item list");

      const queryText = `select * from "no-stock" ORDER BY id DESC`;
      await pool
        .query(queryText)
        .then((selectResult) => {
          res.send(selectResult.rows);
        })
        .catch((error) => {
          logtail.info(`--NSN-- Error on item query ${error}`);
          res.sendStatus(500);
        });
    } catch (err) {
      logtail.info('--NSN-- Error on Get: ', err);
      return res.status(500).send();
    }
});
                                            
router.put("/updateReason", (req, res) => {
  //logtail.info(req.body.payload);
  const payload = req.body.payload;
  const id = payload.id
  const reason = payload.reason;
  logtail.info("--NSN-- We are updating a reason of " + reason + " on NSN item with id: ", id);

  const queryText = `UPDATE "no-stock" SET reason = $1 WHERE id = $2`;
  pool
    .query(queryText, [reason, id])
    .then((updateResult) => {
      const queryText = `select * from "no-stock" ORDER BY id DESC`;
      pool
        .query(queryText)
        .then((selectResult) => {
          res.send(selectResult.rows);
        })
        .catch((error) => {
          logtail.info(`--NSN-- Error on item query ${error}`);
          res.sendStatus(500);
        });
    })
    .catch((error) => {
      logtail.info(`--NSN-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.put("/test", (req, res) => {
  //logtail.info(req.body.test);
  const test = req.body.test;
  logtail.info("--NSN-- We are running an NSN test for: ", test);

  t(test);


  async function t(test) {

    logtail.info('(--NSN-- TEST)');
  
    const tester = test;
  
    let bcResponse = [];
    let getItems = [];
    let varItems = [];
  
    try {
      bcResponse = await getBCItems();
    } catch (err) {
      logtail.info('--NSN-- Error on getBCItems: ', err);
    }
  
    await timeoutPromise(500);
  
    try {
      const queryText = `select * from "no-stock" WHERE reason <> 'clothing' ORDER BY id DESC`;
      await pool
        .query(queryText)
        .then((getResult) => {
          getItems = getResult.rows;
        })
    } catch (err) {
      logtail.info('--NSN-- Error on getItems: ', err);
    }
  
    for (const item of bcResponse) {
      if (item.name === tester) {
        logtail.info('--NSN-- BC Found!');
        try {
          let checkedItem = [];
          checkedItem.push(item);
          varItems = await getVars(checkedItem);
          logtail.info('--NSN-- Vars (TEST): ', varItems);
        } catch (err) {
          logtail.info('--NSN-- Error on getVar: ', err);
        }
      }
    }
  
    for (const item of getItems) {
      if (item.name === tester) {
        logtail.info('--NSN-- DB Found!');
       }
    }
  
    let newItems = [];
  
    try {
  
      if (!getItems[0]) {
        //logtail.info('Item DB Empty!');
        for (const v of varItems) {
  
          if (v.inventory_level === 0) {
            let bcItemName = v.name;
            let bcItemSku = v.sku;
            let bcItemId = v.id;
            let variant = {
              name: bcItemName,
              sku: bcItemSku,
              id: bcItemId,
              inventory_tracking: v.inventory_tracking,
              inventory_level: v.inventory_level,
              level: 'Variant',
            };
            newItems.push(variant);
          } else {
            //logtail.info('Variant not at 0 stock!');
          }
        }
      } else {
  
        for (const v of varItems) {
          let bcItemId = v.id;
          let canInsert = true;
  
          for (const item of getItems) {
            if (bcItemId === item.id) {
              canInsert = false;
            }
          }
  
          if (v.inventory_level === 0 && canInsert === true) {
            let bcItemSku = v.sku;
            let bcItemId = v.id;
            let bcItemName = v.name;
            let variant = {
              name: bcItemName,
              sku: bcItemSku,
              id: bcItemId,
              inventory_tracking: v.inventory_tracking,
              inventory_level: v.inventory_level,
              level: 'Variant',
            };
            newItems.push(variant);
          } else {
            //logtail.info('Variant not at 0 stock!');
          }
        }
      }
    } catch (err) {
      logtail.info('--NSN-- Error on varMsg: ', err);
    }
  
    logtail.info('--NSN-- New Items (TEST): ', newItems);
  
  
  
        try {
          if (getItems[0]) {
            for (const v of varItems) {
              bcItemId = v.id;
              let bcItemSku = v.sku;
              let bcItemInv = v.inventory_level;
              for (const item of getItems) {
                let itemId = item.id;
                let itemSku = item.sku;
                if (bcItemId === itemId && bcItemSku === itemSku && bcItemInv !== 0) {
                  //logtail.info(`BCId: ${bcItemId}, ItemId: ${itemId}`);
                  //logtail.info(`BCSku: ${bcItemSku}, ItemSku: ${itemSku}`);
                  //logtail.info('Stock: ', bcItemInv);
                  let itemToPush = {
                    id: itemId,
                  }
                  logtail.info('--NSN-- Found this id for removing from NSN: ', itemToPush);
                }
              }
            }
          }
        } catch (err) {
          logtail.info('--NSN-- Error on get Var Stocked: ', err);
        }
  
    logtail.info('--NSN-- Test Done');
  
  }
  
  res.sendStatus(200);
});

router.get("/test/message", (req, res) => {

  logtail.info("--NSN-- We are sending a test slack message..");

  let slackText = `:test_tube: *THIS IS A TEST MESSAGE! WALLY B OUT!* :test_tube:`;

  (async () => {
    // See: https://api.slack.com/methods/chat.postMessage
    const msg = await web.chat.postMessage({
      icon_emoji: ":test_tube:",
      channel: conversationId,
      text: `${slackText}`,
    });

    // `msg` contains information about the posted message

    logtail.info("--NSN-- Message sent: ", msg);
  })();
  
  res.sendStatus(200);
});


module.exports = router;