require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../../../modules/pool');
const puppeteer = require('puppeteer');

router.post('/create-order', async function (req, res) {
  if (req.body.data) {
    const orderID = req.body.data.id;
    try {
      const orderData = await getOrderData(orderID);
      if (orderData) {
        await addOrderToDatabase(orderData, res);
      } else {
        res.status(404).json({ success: false, message: 'Order not found' });
      }
    } catch (err) {
      console.error('Failed to handle order creation:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    console.error('No order data provided');
    res.status(400).json({ success: false, message: 'No order data provided' });
  }
});

router.post('/sync', async function (req, res) {
  try {
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders?limit=50&sort=date_created:desc&include=consignments`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': process.env.BG_AUTH_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const orders = await response.json();
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const products = await getProductsOnOrder(order.products.url);
        return {
          order_id: order.id,
          created_at: order.date_created,
          line_items: products.map((product) => ({
            id: product.id,
            order_id: order.id,
            name: product.name,
            sku: product.sku,
            quantity: product.quantity,
            price: product.total_inc_tax,
            options: product.product_options.map((opt) => ({
              display_name: opt.display_name,
              display_value: opt.display_value,
            })),
          })),
          shipping: {
            shipping_method: order.consignments[0].shipping[0].shipping_method,
            cost_inc_tax: order.consignments[0].shipping[0].cost_inc_tax,
            street_1: order.consignments[0].shipping[0].street_1,
            street_2: order.consignments[0].shipping[0].street_2,
            city: order.consignments[0].shipping[0].city,
            state: order.consignments[0].shipping[0].state,
            zip: order.consignments[0].shipping[0].zip,
            country: order.consignments[0].shipping[0].country,
          },
          customer: {
            first_name: order.billing_address.first_name,
            last_name: order.billing_address.last_name,
            email: order.billing_address.email,
            phone: order.billing_address.phone,
          },
          subtotal: order.subtotal_ex_tax,
          tax: order.total_tax,
          grand_total: order.total_inc_tax,
          total_items: order.items_total,
          status: order.status,
        };
      })
    );

    if (ordersWithProducts.length > 0) {
      for (const orderData of ordersWithProducts) {
        await addOrderToDatabase(orderData, res);
      }
      res.status(200).json({ success: true, message: 'Orders synced successfully' });
    }
  } catch (error) {
    console.error('Error syncing orders:', error);
  }
});

const getOrderData = async (orderID) => {
  try {
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderID}?include=consignments`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': process.env.BG_AUTH_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const order = await response.json();
    const products = await getProductsOnOrder(order.products.url);
    const ordersWithProducts = {
      order_id: order.id,
      created_at: order.date_created,
      line_items: products.map((product) => ({
        id: product.id,
        order_id: order.id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        price: product.total_inc_tax,
        options: product.product_options.map((opt) => ({
          display_name: opt.display_name,
          display_value: opt.display_value,
        })),
      })),
      shipping: {
        shipping_method: order.consignments[0].shipping[0].shipping_method,
        cost_inc_tax: order.consignments[0].shipping[0].cost_inc_tax,
        street_1: order.consignments[0].shipping[0].street_1,
        street_2: order.consignments[0].shipping[0].street_2,
        city: order.consignments[0].shipping[0].city,
        state: order.consignments[0].shipping[0].state,
        zip: order.consignments[0].shipping[0].zip,
        country: order.consignments[0].shipping[0].country,
      },
      customer: {
        first_name: order.billing_address.first_name,
        last_name: order.billing_address.last_name,
        email: order.billing_address.email,
        phone: order.billing_address.phone,
      },
      subtotal: order.subtotal_ex_tax,
      tax: order.total_tax,
      grand_total: order.total_inc_tax,
      total_items: order.items_total,
      status: order.status,
    };
    return ordersWithProducts;
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

const getProductsOnOrder = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': process.env.BG_AUTH_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products on order:', error);
    throw error;
  }
};

const addOrderToDatabase = async (orderData, res) => {
  try {
    console.log('Inserting order into database:', orderData);

    const {
      order_id,
      line_items,
      shipping,
      customer,
      subtotal,
      tax,
      grand_total,
      total_items,
      status,
    } = orderData;

    // Check if order already exists
    const existingOrder = await pool.query('SELECT id FROM picklist_orders WHERE order_id = $1', [
      order_id,
    ]);

    if (existingOrder.rows.length > 0) {
      console.log(`Order ${order_id} already exists. Skipping insert.`);
      return res.status(200).json({ success: false, message: 'Order already exists' });
    }

    const result = await pool.query(
      `
      INSERT INTO picklist_orders (
        order_id,
        line_items,
        shipping,
        customer,
        subtotal,
        tax,
        grand_total,
        status,
        total_items
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
      `,
      [
        order_id,
        JSON.stringify(line_items),
        JSON.stringify(shipping),
        JSON.stringify(customer),
        subtotal,
        tax,
        grand_total,
        status,
        total_items,
      ]
    );

    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Error inserting order:', err);
    res.status(500).json({ success: false, message: 'Failed to insert order' });
  }
};

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM picklist_orders ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.put('/mark-printed', async (req, res) => {
  const { orderIds } = req.body;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ message: 'orderIds must be a non-empty array' });
  }

  try {
    const result = await pool.query(
      `
      UPDATE picklist_orders
      SET is_printed = true,
          printed_time = now()
      WHERE order_id = ANY($1::int[])
      `,
      [orderIds]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error updating printed orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to update orders' });
  }
});

router.post('/print-pdf', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).send('Missing HTML');
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="print.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (err) {
    console.error('Puppeteer PDF generation error:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

module.exports = router;
