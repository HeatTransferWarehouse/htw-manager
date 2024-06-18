import React from "react";
import "./css/Main.css";

function Resources() {
  //defines the dataselector to know which items to preform actions on
  return (
    <>
      <div className="bg-gray-200">
        <section className="py-24 animate-bg mb-8">
          <div className="flex flex-col px-4 items-center justify-center gap-4">
            <h1 className="!text-6xl !font-normal !text-center !text-white z-30">
              Your Trusted Source for <strong>HTV</strong>,<br />
              <strong>Craft Vinyl</strong>, <strong>Presses</strong>,<br />
              <strong>Equipment</strong>, <strong>Sublimation</strong>, and More
            </h1>
            <p className="text-lg text-center text-white">
              This is a list of all Resources and links to all of our Websites,
              Custom Apps, and more
            </p>
          </div>
        </section>

        <section className="px-4">
          <div className="mx-auto">
            <h2 className="text-3xl text-center mb-4 font-bold">
              HTW Websites
            </h2>
            <p className="text-center text-lg">
              These are all Live, Testing, and Coming Soon Websites managed by
              Heat Transfer Warehouse.
            </p>
          </div>
          <div className="grid py-16 grid-cols-1 md:grid-cols-2 mx-auto w-full gap-8 max-w-screen-2xl">
            <div className="shadow-default p-4 rounded-md bg-white">
              <h3 className="text-xl font-bold text-center mb-4">Main Site</h3>
              <div className="p-4 flex flex-col bg-gray-200 items-center justify-center text-black rounded-md">
                <p className="text-2xl relative flex items-center">
                  Live
                  <span className="absolute -right-5 border w-3 h-3 border-solid border-green-700 rounded-full flex item justify-center">
                    <span className="animate-pulse bg-green-700 relative top-[1px] rounded-full w-2 h-2" />
                  </span>
                </p>
                <p>This site is open to the public</p>
              </div>
              <ul className="flex flex-col items-center justify-center mx-0 my-8 gap-2">
                <li className="text-gray-500">HTV</li>
                <li className="text-gray-500">Blanks</li>
                <li className="text-gray-500">Rhinestones</li>
                <li className="text-gray-500">Printables</li>
                <li className="text-gray-500">Adhesives</li>
                <li className="text-gray-500">Sublimation</li>
              </ul>
              <a
                href="https://heattransferwarehouse.com"
                target="_blank"
                className="px-6 py-2 w-fit mx-auto flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Go to Site
              </a>
            </div>
            <div className="shadow-default p-4 rounded-md bg-white">
              <h3 className="text-xl font-bold text-center mb-4">Sandbox</h3>
              <div className="bg-gray-200 p-4 flex flex-col items-center justify-center text-black rounded-md">
                <p className="text-2xl relative flex items-center">
                  Live
                  <span className="absolute -right-5 border w-3 h-3 border-solid border-green-700 rounded-full flex item justify-center">
                    <span className="animate-pulse bg-green-700 relative top-[1px] rounded-full w-2 h-2" />
                  </span>
                </p>
                <p>Preview Code: 7tkvu49kwo</p>
              </div>
              <ul className="flex flex-col items-center justify-center mx-0 my-8 gap-1">
                <li className="text-gray-500">For Testing ONLY</li>
                <li className="text-gray-500">Test new Apps</li>
                <li className="text-gray-500">and products</li>
                <li className="text-gray-500">before an official</li>
                <li className="text-gray-500">launch on</li>
                <li className="text-gray-500">a live site!</li>
              </ul>
              <a
                href="https://heattransferwarehouse.com"
                target="_blank"
                className="px-6 py-2 w-fit mx-auto flex bg-primary rounded-md text-white"
                rel="noopener noreferrer">
                Go to Site
              </a>
            </div>
          </div>
        </section>

        <section className="mt-48 px-4">
          <div className="mx-auto flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl font-bold">Tools and Resources</h1>
            <p>Basic Tools/Resources to help in every day workflow.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-8 mx-auto gap-4 md:gap-8 max-w-screen-2xl">
            <div className="shadow-default p-4 text-gray-700 justify-between rounded-md flex flex-col gap-2 bg-white">
              <div>
                <p className="font-semibold">Web/Dev Logins and API</p>
                <p>Information and Login Credentials for the Webs and Devs.</p>
              </div>
              <a
                href="https://docs.google.com/spreadsheets/d/1Ebf_nSvXy3PFdRMtbBuyksvZwnET6vtX0sCEZV6kG2M/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Open
              </a>
            </div>
            <div className="shadow-default p-4 text-gray-700 justify-between rounded-md flex flex-col gap-2 bg-white">
              <div>
                <p className="font-semibold">CSR Vinyl Calculator</p>
                <p>
                  Calculate Vinyl Estimates and recommended lengths for
                  customers based on the product.
                </p>
              </div>
              <a
                href="https://www.heattransferwarehouse.com/csr-vinyl-calculator/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Open
              </a>
            </div>
            <div className="shadow-default p-4 text-gray-700 justify-between rounded-md flex flex-col gap-2 bg-white">
              <div>
                <p className="font-semibold">Supacolor Calculator</p>
                <p>
                  Estimates the size of Supacolor that the customer should order
                  based on the type and proportions wanted.
                </p>
              </div>
              <a
                href="https://www.heattransferwarehouse.com/supacolor-calculator/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Open
              </a>
            </div>
            <div className="shadow-default p-4 text-gray-700 justify-between rounded-md flex flex-col gap-2 bg-white">
              <div>
                <p className="font-semibold">HTV Calculator</p>
                <p>
                  Estimates the ammount of yardage needed for a project based
                  off the size of the HTV being purchased.
                </p>
              </div>
              <a
                href="https://www.heattransferwarehouse.com/htv-calculator/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Open
              </a>
            </div>
            <div className="shadow-default p-4 text-gray-700 justify-between rounded-md flex flex-col gap-2 bg-white">
              <div>
                <p className="font-semibold">Rhinestone Calculator</p>
                <p>
                  Estimates the price of a custom rhinestone transfer given the
                  size and stone colors.
                </p>
              </div>
              <a
                href="https://www.heattransferwarehouse.com/rhinestone-calculator/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Open
              </a>
            </div>
            <div className="shadow-default p-4 text-gray-700 justify-between rounded-md flex flex-col gap-2 bg-white">
              <div>
                <p className="font-semibold">Processes Document</p>
                <p>
                  List of all in house processes and procedures. All are
                  categorized by department
                </p>
              </div>
              <a
                href="https://docs.google.com/document/d/1YoZOUH5K1CC3kAakhIAjxUxKXfMATjcjF3ozZn_JAgA/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Open
              </a>
            </div>
          </div>
        </section>

        <section className="mt-48 pb-12 px-4">
          <div className="mx-auto">
            <h2 className="text-3xl text-center mb-4 font-bold">Services</h2>
            <p className="text-center">
              Links to pages, support numbers, and more for services we use.
              Most of these require a login.
            </p>
          </div>
          <div className="grid mt-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-screen-2xl mx-auto gap-4 md:gap-8">
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Digital Ocean</p>
                <p>
                  Houses all of our custom servers, apps, and databases. Deploy,
                  redeploy, and manage our servers and data.
                </p>
              </div>
              <a
                href="https://docs.digitalocean.com/support/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">SendGrid</p>
                <p>
                  Used to send custom emails to customers. Used for emails with
                  SanMar, OSIAffiliate, etc.
                </p>
              </div>
              <a
                href="https://support.sendgrid.com/hc/en-us"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">OSIAffiliate</p>
                <p>
                  Used for our affiliates to generate custom links to our site
                  and refer our products.
                </p>
              </div>
              <a
                href="https://support.osiaffiliate.com/support/home"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Zendesk</p>
                <p>
                  Chat service on our websites to chat live with customers and
                  offer support.
                </p>
              </div>
              <a
                href="https://support.zendesk.com/hc/en-us/categories/4405298745370-Support"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Afterpay</p>
                <p>
                  One of our Afterpayment methods. Customers can pay off their
                  bill over 4 weeks.
                </p>
              </div>
              <a
                href="https://help.afterpay.com/hc/en-us/categories/900000234146-I-M-A-MERCHANT"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Klarna</p>
                <p>
                  One of our Afterpayment methods. Customers can pay off over 4
                  weeks or via Financing.
                </p>
              </div>
              <a
                href="https://www.klarna.com/us/customer-service/"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Bolt</p>
                <p>
                  Used for processing payments and in the customer
                  checkout/login.
                </p>
              </div>
              <a
                href="https://support.bolt.com/hc/en-us"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Klaviyo</p>
                <p>
                  Our main means of marketing, emails, text, and mass marketing
                  campaigns.
                </p>
              </div>
              <a
                href="https://help.klaviyo.com/hc/en-us"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">BigCommerce</p>
                <p>
                  Hosts our main websites and tracks new orders, customers, and
                  sales.
                </p>
              </div>
              <a
                href="https://support.bigcommerce.com/s/?language=en_US"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Brightpearl</p>
                <p>
                  Links all orders, sales, customers, products, inventory, and
                  more in one place.
                </p>
              </div>
              <a
                href="https://www.brightpearl.com/contact-support"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Shipstation</p>
                <p>
                  Process Goods out Notes, send info to FedEx and UPS, and
                  manage Shipping.
                </p>
              </div>
              <a
                href="https://help.shipstation.com/hc/en-us"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">ShipperHQ</p>
                <p>Manage Shipping Quotes and Methods to show at checkout.</p>
              </div>
              <a
                href="https://docs.shipperhq.com"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
            <div className="p-4 flex flex-col justify-between gap-4 bg-white shadow-default rounded-md text-gray-700">
              <div>
                <p className="font-semibold">Go Daddy</p>
                <p>
                  Setup and Manage our Domains, manage DNS Settings, and more.
                </p>
              </div>
              <a
                href="https://www.godaddy.com/contact-us"
                target="_blank"
                className="px-6 py-2 w-fit mt-2 flex bg-secondary rounded-md text-white"
                rel="noopener noreferrer">
                Support Docs
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Resources;
