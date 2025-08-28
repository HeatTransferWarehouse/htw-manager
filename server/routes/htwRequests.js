require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs').promises; // Use the Promise-based fs API
const multer = require('multer');
const { exec } = require('child_process');
const sharp = require('sharp'); // Import sharp for image processing
const PSD = require('psd'); // Import psd.js
const path = require('path');
const sizeOf = require('image-size'); // Import image-size package for getting dimensions
const { PDFDocument } = require('pdf-lib'); // Import pdf-lib for PDF processing

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to save buffer to file
const saveBufferToFile = (buffer, filename) => {
  const filePath = path.join('uploads', filename);
  return fs.writeFile(filePath, buffer).then(() => filePath);
};

router.post('/update-item-price', async (req, res) => {
  try {
    const data = req.body;
    const cartItem = data.cartItem;
    const cartItemId = data.cartItemId;
    const cartId = data.cartId;
    const itemPrice = data.itemPrice;
    const shouldAddDigitalProof = data.shouldAddDigitalProof;
    const digitalProofID = parseInt(data.digitalProofID, 10);

    const requestOrigin = req.get('origin');

    let hash, apiKey;

    if (requestOrigin === 'https://heat-transfer-warehouse-sandbox.mybigcommerce.com') {
      hash = process.env.SANDBOX_HASH;
      apiKey = process.env.SANDBOX_API_KEY;
    } else if (
      requestOrigin === 'https://www.heattransferwarehouse.com' ||
      requestOrigin === 'https://heattransferwarehouse.biz'
    ) {
      hash = process.env.STORE_HASH;
      apiKey = process.env.BG_AUTH_TOKEN;
    } else {
      throw new Error('Invalid origin');
    }

    // URL for adding the item to the cart
    const updateUrl = `https://api.bigcommerce.com/stores/${hash}/v3/carts/${cartId}/items/${cartItemId}`;

    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-Token': apiKey,
    };

    const constructedCartItem = {
      line_item: {
        list_price: itemPrice,
        quantity: cartItem.quantity,
        variant_id: cartItem.variant_id,
        product_id: cartItem.product_id,
      },
    };

    const updateOptions = {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(constructedCartItem),
    };

    const updateResponse = await fetch(updateUrl, updateOptions);

    if (!updateResponse.ok) {
      console.error('Failed to update item price', updateResponse);
      return res.status(updateResponse.status).json({
        message: updateResponse,
        success: false,
      });
    }

    const jsonResponse = await updateResponse.json();

    if (shouldAddDigitalProof) {
      await addDigitalProofItem(jsonResponse.data.id, digitalProofID, apiKey, hash);

      res.json({
        message: 'Item price and digital proof successfully updated',
        data: jsonResponse,
        success: true,
      });
    } else {
      res.json({
        message: 'Item price successfully updated',
        data: jsonResponse,
        success: true,
      });
    }
  } catch (error) {
    console.error('Error processing cart data:', error);
    res.status(500).json({
      message: 'Server error while processing cart data',
      error,
    });
  }
});

const addDigitalProofItem = async (cartId, digitalProofID, apiKey, hash) => {
  const url = `https://api.bigcommerce.com/stores/${hash}/v3/carts/${cartId}/items`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': apiKey,
  };
  const body = {
    line_items: [
      {
        product_id: digitalProofID,
        quantity: 1,
        variant_id: 157415,
      },
    ],
  };
  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    if (response.status === 409 && response.statusText === 'Conflict') {
      return response.json(); // If the item already exists, return the response
    }
    console.error('Failed to add digital proof item', response);
    throw new Error(`Failed to add digital proof item: ${response.statusText}`);
  }

  const jsonResponse = await response.json();
  return jsonResponse;
};

router.post('/cart-transfer-price', async (req, res) => {
  try {
    const requestOrigin = req.get('origin');

    let hash, apiKey;

    if (requestOrigin === 'https://heat-transfer-warehouse-sandbox.mybigcommerce.com') {
      hash = process.env.SANDBOX_HASH;
      apiKey = process.env.SANDBOX_API_KEY;
    } else if (
      requestOrigin === 'https://www.heattransferwarehouse.com' ||
      requestOrigin === 'https://www.heattransferwarehouse.biz'
    ) {
      hash = process.env.STORE_HASH;
      apiKey = process.env.BG_AUTH_TOKEN;
    } else {
      throw new Error('Invalid origin');
    }

    const data = req.body;
    const cartId = data.cartId;
    const cartItemId = data.cartItem.id;
    const cartItem = data.cartItem;
    const cartItemQty = data.qty;
    const cartItemPrice = data.price;

    const constructedCartItem = {
      line_item: {
        list_price: cartItemPrice,
        quantity: cartItemQty,
        variant_id: cartItem.variant_id,
        product_id: cartItem.product_id,
      },
    };

    const updateUrl = `https://api.bigcommerce.com/stores/${hash}/v3/carts/${cartId}/items/${cartItemId}`;

    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-Token': apiKey,
    };

    const updateOptions = {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(constructedCartItem),
    };

    const updateResponse = await fetch(updateUrl, updateOptions);

    if (!updateResponse.ok) {
      const errorMessage = `Failed to transfer cart item. Status: ${updateResponse}`;
      console.error(errorMessage);
      return res.status(updateResponse.status).json({
        message: errorMessage,
        success: false,
      });
    }

    const jsonResponse = await updateResponse.json();

    res.json({
      message: 'Item price successfully updated',
      data: {
        cart: jsonResponse,
        cartItemId: cartItemId,
        qty: cartItemQty,
        cartItemPrice: cartItemPrice,
      },
      success: true,
    });
  } catch (error) {
    console.error('Error processing cart data:', error);
    res.status(500).json({
      message: 'Server error while processing cart data',
      error,
    });
  }
});

router.post('/cart-related-products', async (req, res) => {
  try {
    const { productIds, token, query } = req.body;

    // Fetch GraphQL data
    const response = await fetch(`https://heattransferwarehouse.com/graphql`, {
      method: 'POST',
      credentials: 'same-origin', // You might not need this for external domains
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: query,
        variables: {
          entityId: productIds[0],
        },
      }),
    });

    if (!response.ok) {
      // Handle non-200 HTTP responses
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Ensure the structure is as expected
    const relatedProducts = result.data?.site?.product?.relatedProducts?.edges || [];

    // Build HTML from related products
    const productsHtml = buildRelatedProductsHTML(relatedProducts);

    res.send(productsHtml); // Send the HTML response to the client
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error while processing cart data',
      error: err.message || err,
    });
  }
});

// Build related products HTML
const buildRelatedProductsHTML = (products) => {
  const relatedProducts = products.map((product) => {
    return buildRelatedProductElement(product.node);
  });

  return relatedProducts.join('');
};

// Build individual product HTML
const buildRelatedProductElement = (product) => {
  return `
    <article class="card">
      <a href="${product.path}">
        <figure class="card-figure">
          <div class="card-image-container">
            <img src="${product.defaultImage.url}" alt="${
              product.defaultImage.altText ? product.defaultImage.altText : product.name
            }" />
          </div>
        </figure>
        <div class="card-body">
          <p class="card-text">${product.brand.name}</p>
          <span class="card-title">${product.name}</span>
          <div class="card-text">
            <div class="price-section price-section--withoutTax">
              ${
                product.prices.priceRange
                  ? `<span class="price price--withoutTax">$${product.prices.priceRange.min.value.toFixed(
                      2
                    )} - $${product.prices.priceRange.max.value.toFixed(2)}</span>`
                  : `<span class="price price--withoutTax">$${product.prices.price.value.toFixed(
                      2
                    )}</span>`
              }
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
};

router.post('/get-customer-group-info/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/customer_groups/${customerId}`;

    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.BG_AUTH_TOKEN,
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorMessage = `Failed to transfer cart item. Status: ${response}`;
      console.error(errorMessage);
      return res.status(response.status).json({
        message: errorMessage,
        success: false,
      });
    }

    const jsonResponse = await response.json();

    res.json({
      message: 'Customer Group Info successfully retrieved',
      data: jsonResponse,
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error while processing cart data',
      error: err.message || err,
    });
  }
});

router.post('/process-image', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = file.buffer; // Access the file buffer
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const originalFileName = file.originalname;
    const fileStats = {
      size: file.size, // Size in bytes
      mimetype: file.mimetype, // MIME type of the file
    };

    // Handle PNG, JPEG, JPG, SVG (already images, no conversion needed)

    if (['png', 'jpeg', 'jpg'].includes(fileExtension)) {
      const metadata = await sharp(fileBuffer).metadata();

      const width = metadata.width;
      const height = metadata.height;
      const density = metadata.density || 72; // default to 72 PPI if not provided

      const widthInInches = width / density;
      const heightInInches = height / density;

      const base64Image = fileBuffer.toString('base64');

      return res.json({
        image: `data:${file.mimetype};base64,${base64Image}`,
        aspectRatio: width / height,
        widthInInches,
        heightInInches,
        ppi: density,
        size: metadata.size,
        type: 'image',
      });
    }

    // Handle EPS and AI files with ImageMagick
    else if (fileExtension === 'eps' || fileExtension === 'ai') {
      res.json({
        image: ``,
        aspectRatio: 1,
        ppi: 72,
        widthInInches: 2,
        heightInInches: 2,
        size: fileStats.size,
        type: 'vector',
      });
    }

    // Handle PSD files with psd.js
    else if (fileExtension === 'psd') {
      // Save the buffer to disk before processing with psd.js
      const filePath = await saveBufferToFile(fileBuffer, originalFileName);

      const psd = await PSD.fromFile(filePath);

      psd.parse();

      const previewPath = `uploads/${file.filename}.png`;
      psd.image
        .saveAsPng(previewPath)
        .then(async () => {
          const metadata = await sharp(previewPath).metadata();

          const ppi = metadata.density || 72;
          const widthInInches = metadata.width / ppi;
          const heightInInches = metadata.height / ppi;
          const aspectRatio = metadata.width / metadata.height;

          console.log('Aspect Ratio:', aspectRatio);
          console.log('PPI:', ppi);

          // Convert to base64
          const previewBuffer = await fs.readFile(previewPath);
          const base64Image = previewBuffer.toString('base64');

          res.json({
            image: `data:image/png;base64,${base64Image}`,
            aspectRatio,
            ppi,
            widthInInches,
            heightInInches,
            size: metadata.size,
            type: 'image',
          });

          // Clean up temporary files
          await fs.unlink(filePath);
          await fs.unlink(previewPath);
        })
        .catch((error) => {
          console.error('Error processing PSD file:', error);
          res.status(500).json({ message: 'Failed to generate PSD preview' });
        });
    }

    // Handle PDF files
    else if (fileExtension === 'pdf') {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const page = pdfDoc.getPage(0);

      const { width, height } = page.getSize();

      // Render the page to PNG (pdf-lib supports embedded PNG/JPG but not rasterizing)
      // You'll need to use pdf-lib only for metadata, then fallback to sharp/imagemagick for actual rendering

      // TEMPORARY: fallback response
      return res.json({
        image: '', // Placeholder if you don't rasterize here
        aspectRatio: width / height,
        widthInInches: width / 72,
        heightInInches: height / 72,
        ppi: 72,
        size: fileStats.size,
        type: 'pdf',
      });
    } else if (fileExtension === 'svg') {
      // Parse the SVG XML to get dimensions
      const svgString = fileBuffer.toString('utf8');
      const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
      const widthMatch = svgString.match(/width="([^"]+)"/);
      const heightMatch = svgString.match(/height="([^"]+)"/);

      let width = 0;
      let height = 0;

      if (widthMatch && heightMatch) {
        width = parseFloat(widthMatch[1]);
        height = parseFloat(heightMatch[1]);
      } else if (viewBoxMatch) {
        const viewBoxValues = viewBoxMatch[1].split(' ').map(Number);
        width = viewBoxValues[2];
        height = viewBoxValues[3];
      } else {
        width = 100; // fallback default
        height = 100;
      }

      // Optionally render to PNG for preview
      const pngBuffer = await sharp(fileBuffer).png().toBuffer();
      const base64Image = pngBuffer.toString('base64');

      return res.json({
        image: `data:image/png;base64,${base64Image}`,
        aspectRatio: width / height,
        widthInInches: width / 72, // assuming 72 PPI for fallback
        heightInInches: height / 72,
        ppi: 72,
        size: fileStats.size,
        type: 'svg',
      });
    }

    // Unsupported file type
    else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ message: 'Server error while generating preview' });
  }
});

module.exports = router;
