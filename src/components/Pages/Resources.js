import React from "react";
import "./css/Main.css";
import "./css/bootstrap.min.css";
import "./css/font-awesome.css";
import "./css/flex-slider.css";
import "./css/templatemo-softy-pinko.css";

function Resources() {
  //defines the dataselector to know which items to preform actions on
  return (
    <>
      <div className="welcome-area" id="welcome">
        <div className="header-text">
          <div className="container">
            <div className="row">
              <div className="offset-xl-3 col-xl-6 offset-lg-2 col-lg-8 col-md-12 col-sm-12">
                <h1>
                  Your Trusted Source for <strong>HTV</strong>,<br />{" "}
                  <strong>Craft Vinyl</strong>, <strong>Presses</strong>,{" "}
                  <strong>Equipment</strong>, <strong>Sublimation</strong>, and
                  More
                </h1>
                <p>
                  This is a list of all Resources and links to all of our
                  Websites, Custom Apps, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section" id="websites">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="center-heading">
                <h2 className="section-title">HTW Websites</h2>
              </div>
            </div>
            <div className="offset-lg-3 col-lg-6">
              <div className="center-text">
                <p>
                  These are all Live, Testing, and Coming Soon Websites managed
                  by Heat Transfer Warehouse.
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div
              className="col-lg-4 col-md-6 col-sm-12"
              data-scroll-reveal="enter bottom move 50px over 0.6s after 0.2s">
              <div className="pricing-item">
                <div className="pricing-header">
                  <h3 className="pricing-title">Main Site</h3>
                </div>
                <div className="pricing-body">
                  <div className="price-wrapper">
                    <span className="currency"></span>
                    <span className="price">Live</span>
                    <span className="period">
                      This site is open to the public
                    </span>
                  </div>
                  <ul className="list">
                    <li className="active">HTV</li>
                    <li className="active">Blanks</li>
                    <li className="active">Rhinestones</li>
                    <li className="active">Printables</li>
                    <li className="active">Adhesives</li>
                    <li className="active">Sublimation</li>
                  </ul>
                </div>
                <div className="pricing-footer">
                  <a
                    href="https://heattransferwarehouse.com"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Go to Site
                  </a>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 col-sm-12"
              data-scroll-reveal="enter bottom move 50px over 0.6s after 0.4s">
              <div className="pricing-item active">
                <div className="pricing-header">
                  <h3 className="pricing-title">Turbo HTV</h3>
                </div>
                <div className="pricing-body">
                  <div className="price-wrapper">
                    <span className="currency"></span>
                    <span className="price">Live</span>
                    <span className="period">
                      This site is open to the public
                    </span>
                  </div>
                  <ul className="list">
                    <li className="active">POLI-TAPE Site</li>
                    <li className="active">HTV</li>
                    <li className="active">Decorative HTV</li>
                    <li className="active">Printables</li>
                    <li className="active">Equipment</li>
                    <li className="active">Accessories</li>
                  </ul>
                </div>
                <div className="pricing-footer">
                  <a
                    href="https://turbohtv.com"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Go to Site
                  </a>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 col-sm-12"
              data-scroll-reveal="enter bottom move 50px over 0.6s after 0.6s">
              <div className="pricing-item">
                <div className="pricing-header">
                  <h3 className="pricing-title">Sandbox</h3>
                </div>
                <div className="pricing-body">
                  <div className="price-wrapper">
                    <span className="currency"></span>
                    <span className="price">Live</span>
                    <span className="period">Preview Code: 7tkvu49kwo</span>
                  </div>
                  <ul className="list">
                    <li className="active">For Testing ONLY</li>
                    <li className="active">Test new Apps</li>
                    <li className="active">and products</li>
                    <li className="active">before an official</li>
                    <li className="active">launch on</li>
                    <li className="active">a live site!</li>
                  </ul>
                </div>
                <div className="pricing-footer">
                  <a
                    href="https://heat-transfer-warehouse-sandbox.mybigcommerce.com/"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Go to Site
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mini" id="tools">
        <div className="mini-content">
          <div className="container">
            <div className="row">
              <div className="offset-lg-3 col-lg-6">
                <div className="info">
                  <h1>Tools and Resources</h1>
                  <p>Basic Tools/Resources to help in every day workflow.</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="team-item">
                  <div className="team-content">
                    <i></i>
                    <div className="team-info">
                      <a
                        href="https://docs.google.com/spreadsheets/d/1Ebf_nSvXy3PFdRMtbBuyksvZwnET6vtX0sCEZV6kG2M/"
                        target="_blank"
                        className="main-button"
                        rel="noopener noreferrer">
                        Open
                      </a>
                    </div>
                    <br />
                    <p>
                      <strong>Web/Dev Logins and API</strong> <br />
                      Information and Login Credentials for the Webs and Devs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="team-item">
                  <div className="team-content">
                    <i></i>
                    <div className="team-info">
                      <a
                        href="https://www.heattransferwarehouse.com/csr-vinyl-calculator/"
                        target="_blank"
                        className="main-button"
                        rel="noopener noreferrer">
                        Open
                      </a>
                    </div>
                    <br />
                    <p>
                      <strong>CSR Vinyl Calculator</strong> <br />
                      Calculate Vinyl Estimates and recommended lengths for
                      customers based on the product.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="team-item">
                  <div className="team-content">
                    <i></i>
                    <div className="team-info">
                      <a
                        href="https://www.heattransferwarehouse.com/supacolor-calculator/"
                        target="_blank"
                        className="main-button"
                        rel="noopener noreferrer">
                        Open
                      </a>
                    </div>
                    <br />
                    <p>
                      <strong>Supacolor Calculator</strong> <br />
                      Estimates the size of Supacolor that the customer should
                      order based on the type and proportions wanted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="team-item">
                  <div className="team-content">
                    <i></i>
                    <div className="team-info">
                      <a
                        href="https://www.heattransferwarehouse.com/htv-calculator/"
                        target="_blank"
                        className="main-button"
                        rel="noopener noreferrer">
                        Open
                      </a>
                    </div>
                    <br />
                    <p>
                      <strong>HTV Calculator</strong> <br />
                      Estimates the ammount of yardage needed for a project
                      based off the size of the HTV being purchased.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="team-item">
                  <div className="team-content">
                    <i></i>
                    <div className="team-info">
                      <a
                        href="https://www.heattransferwarehouse.com/rhinestone-calculator/"
                        target="_blank"
                        className="main-button"
                        rel="noopener noreferrer">
                        Open
                      </a>
                    </div>
                    <br />
                    <p>
                      <strong>Rhinestone Calculator</strong> <br />
                      Estimates the price of a custom rhinestone transfer given
                      the size and stone colors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="team-item">
                  <div className="team-content">
                    <i></i>
                    <div className="team-info">
                      <a
                        href="https://docs.google.com/document/d/1YoZOUH5K1CC3kAakhIAjxUxKXfMATjcjF3ozZn_JAgA/"
                        target="_blank"
                        className="main-button"
                        rel="noopener noreferrer">
                        Open
                      </a>
                    </div>
                    <br />
                    <p>
                      <strong>Processes Document</strong> <br />
                      List of all in house processes and procedures. All are
                      categorized by department
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="resources">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="center-heading">
                <h2 className="section-title">Services</h2>
              </div>
            </div>
            <div className="offset-lg-3 col-lg-6">
              <div className="center-text">
                <p>
                  Links to pages, support numbers, and more for services we use.
                  Most of these require a login.
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://cloud.digitalocean.com/login"
                      target="_blank"
                      rel="noopener noreferrer">
                      Digital Ocean
                    </a>
                  </h3>
                  <div className="text">
                    Houses all of our custom servers, apps, and databases.
                    Deploy, redeploy, and manage our servers and data.
                  </div>
                  <a
                    href="https://docs.digitalocean.com/support/"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://app.sendgrid.com/login"
                      target="_blank"
                      rel="noopener noreferrer">
                      SendGrid
                    </a>
                  </h3>
                  <div className="text">
                    Used to send custom emails to customers. Used for emails
                    with SanMar, OSIAffiliate, etc.
                  </div>
                  <a
                    href="https://support.sendgrid.com/hc/en-us"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://tariehktest.ositracker.com/admin/"
                      target="_blank"
                      rel="noopener noreferrer">
                      OSIAffiliate
                    </a>
                  </h3>
                  <div className="text">
                    Used for our affiliates to generate custom links to our site
                    and refer our products.
                  </div>
                  <a
                    href="https://support.osiaffiliate.com/support/home"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://www.zendesk.com/login/"
                      target="_blank"
                      rel="noopener noreferrer">
                      Zendesk
                    </a>
                  </h3>
                  <div className="text">
                    Chat service on our websites to chat live with customers and
                    offer support.
                  </div>
                  <a
                    href="https://support.zendesk.com/hc/en-us/categories/4405298745370-Support"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://portal.afterpay.com/us/merchant/login"
                      target="_blank"
                      rel="noopener noreferrer">
                      Afterpay
                    </a>
                  </h3>
                  <div className="text">
                    One of our Afterpayment methods. Customers can pay off their
                    bill over 4 weeks.
                  </div>
                  <a
                    href="https://help.afterpay.com/hc/en-us/categories/900000234146-I-M-A-MERCHANT"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://us.portal.klarna.com/"
                      target="_blank"
                      rel="noopener noreferrer">
                      Klarna
                    </a>
                  </h3>
                  <div className="text">
                    One of our Afterpayment methods. Customers can pay off over
                    4 weeks or via Financing.
                  </div>
                  <a
                    href="https://www.klarna.com/us/customer-service/"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://merchant.bolt.com/"
                      target="_blank"
                      rel="noopener noreferrer">
                      Bolt
                    </a>
                  </h3>
                  <div className="text">
                    Used for processing payments and in the customer
                    checkout/login.
                  </div>
                  <a
                    href="https://support.bolt.com/hc/en-us"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://www.klaviyo.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer">
                      Klaviyo
                    </a>
                  </h3>
                  <div className="text">
                    Our main means of marketing, emails, text, and mass
                    marketing campaigns.
                  </div>
                  <a
                    href="https://help.klaviyo.com/hc/en-us"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://login.bigcommerce.com/login"
                      target="_blank"
                      rel="noopener noreferrer">
                      BigCommerce
                    </a>
                  </h3>
                  <div className="text">
                    Hosts our main websites and tracks new orders, customers,
                    and sales.
                  </div>
                  <a
                    href="https://support.bigcommerce.com/s/?language=en_US"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://use1.brightpearlapp.com/admin_login.php?clients_id=heattransfer"
                      target="_blank"
                      rel="noopener noreferrer">
                      Brightpearl
                    </a>
                  </h3>
                  <div className="text">
                    Links all orders, sales, customers, products, inventory, and
                    more in one place.
                  </div>
                  <a
                    href="https://www.brightpearl.com/contact-support"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://ss.shipstation.com/"
                      target="_blank"
                      rel="noopener noreferrer">
                      Shipstation
                    </a>
                  </h3>
                  <div className="text">
                    Process Goods out Notes, send info to FedEx and UPS, and
                    manage Shipping.
                  </div>
                  <a
                    href="https://help.shipstation.com/hc/en-us"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://shipperhq.com"
                      target="_blank"
                      rel="noopener noreferrer">
                      ShipperHQ
                    </a>
                  </h3>
                  <div className="text">
                    Manage Shipping Quotes and Methods to show at checkout.
                  </div>
                  <a
                    href="hhttps://docs.shipperhq.com"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="blog-post-thumb">
                <div className="blog-content">
                  <h3>
                    <a
                      href="https://dcc.godaddy.com/domains"
                      target="_blank"
                      rel="noopener noreferrer">
                      Go Daddy
                    </a>
                  </h3>
                  <div className="text">
                    Setup and Manage our Domains, manage DNS Settings, and more.
                  </div>
                  <a
                    href="https://www.godaddy.com/contact-us"
                    target="_blank"
                    className="main-button"
                    rel="noopener noreferrer">
                    Support Docs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Resources;
