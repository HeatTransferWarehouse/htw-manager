import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import OrdersTable from '../components/orders-table';
import '../styles.css';
import ReactDOM from 'react-dom';
import PrintHtml from '../components/print-html';
import { Close, Info } from '@material-ui/icons';
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from '../../../ui/dropdown';
import { twMerge } from 'tailwind-merge';
import { FaCheck } from 'react-icons/fa6';
import { getLocalPrinters } from '../utils/utils';

const calculateOrderAges = (orders) => {
  const now = Date.now();
  return orders.map((order) => {
    const createdAt = new Date(order.created_at);
    const diffInMs = now - createdAt;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let ageLabel = '';
    if (diffInMinutes < 60) {
      ageLabel = `${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      ageLabel = `${diffInHours} hr`;
    } else {
      ageLabel = `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    }

    return { ...order, age: ageLabel };
  });
};

function ShipstationPickList() {
  const ordersStore = useSelector((state) => state.BC.orders.orders);
  const syncing = useSelector((state) => state.BC.orders.syncing);
  const orderTags = useSelector((state) => state.BC.orders.tags);
  const dispatch = useDispatch();
  const printRef = React.useRef();
  const [orders, setOrders] = React.useState([]);
  const [orderTagsList, setOrdersTagsList] = React.useState(orderTags || []);
  const [activeOrders, setActiveOrders] = React.useState([]);
  const [expandedOrderIDs, setExpandedOrderIDs] = React.useState([]);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState(null);
  const [generatingPDF, setGeneratingPDF] = React.useState(false);
  const [printersList, setPrintersList] = React.useState([]);
  const [selectedPrinter, setSelectedPrinter] = React.useState('');
  const [savedPDFBlob, setSavedPDFBlob] = React.useState(null);
  const [view, setView] = React.useState('all');
  const [currentTime, setCurrentTime] = React.useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000); // every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOrders((prevOrders) => calculateOrderAges(prevOrders));
  }, [currentTime]);

  useEffect(() => {
    dispatch({ type: 'GET_ORDERS' });
    dispatch({ type: 'GET_ORDER_TAGS' });
  }, [dispatch]);

  useEffect(() => {
    setOrders(calculateOrderAges(ordersStore));
  }, [ordersStore]);

  useEffect(() => {
    setOrdersTagsList(orderTags);
  }, [orderTags]);

  const printOrders = async () => {
    generatePDF();
  };

  function getInlineStyledHtml(element) {
    const clone = element.cloneNode(true);

    const applyInlineStyles = (el) => {
      const computed = getComputedStyle(el);
      for (const key of computed) {
        try {
          el.style[key] = computed.getPropertyValue(key);
        } catch {}
      }
      for (const child of el.children) {
        applyInlineStyles(child);
      }
    };

    applyInlineStyles(clone);

    const wrapper = document.createElement('div');
    wrapper.appendChild(clone);
    return wrapper.innerHTML;
  }

  const generatePDF = async () => {
    const ref = printRef.current;
    if (!ref) {
      setGeneratingPDF(false);
      return;
    }

    try {
      // Step 1: Try to fetch available printers
      setGeneratingPDF(true);
      const printersList = await getLocalPrinters();

      if (printersList && printersList.printers.length > 0) {
        setPrintersList(printersList.printers);
        const defaultPrinter = printersList.printers.find((p) => p.is_default);
        setSelectedPrinter(defaultPrinter);
      }

      // Step 2: Inline styles and generate HTML
      const htmlBody = getInlineStyledHtml(ref);
      const html = `<!DOCTYPE html><html><body>${htmlBody}</body></html>`;

      // ✅ Send to your local Python print server
      const response = await fetch('http://localhost:4577/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
        mode: 'cors',
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('PDF Server error:', response.status, text);
        alert('⚠️ PDF generation failed. Please try again.');
        return;
      }

      // Convert response into a blob
      const blob = await response.blob();
      setSavedPDFBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setOpenPrintModal(true);
    } catch (err) {
      console.error('generatePDF error:', err);
      alert('❌ An unexpected error occurred while generating the PDF.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const markPrinterAsDefault = async (printerName) => {
    try {
      const response = await fetch('http://localhost:4577/printers/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ printer: printerName }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const updatePrinters = await getLocalPrinters();
        setPrintersList(updatePrinters.printers);
        const newDefault = updatePrinters.printers.find((p) => p.is_default);
        setSelectedPrinter(newDefault);
      } else {
        console.error('Failed to save default printer:', result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error marking default printer:', err);
    }
  };

  const sendToPrinter = async () => {
    try {
      const formData = new FormData();
      formData.append('pdf', savedPDFBlob);
      formData.append('printerName', selectedPrinter.name);

      const response = await fetch(`http://localhost:4577/print-pdf`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        dispatch({ type: 'MARK_ORDERS_PRINTED', payload: activeOrders.map((o) => o.order_id) });
        setOpenPrintModal(false);
        setSelectedPrinter('');
        setActiveOrders([]);
      } else {
        alert(`Print error: ${result.error}`);
      }
    } catch (err) {
      alert(
        '⚠️ Local print server not detected. Please install and run the print server on your computer.'
      );
    }
  };

  return (
    <div>
      <h1>Big Commerce Orders</h1>
      <OrdersTable
        ordersData={orders}
        activeOrders={activeOrders}
        setActiveOrders={setActiveOrders}
        expandedOrderIDs={expandedOrderIDs}
        setExpandedOrderIDs={setExpandedOrderIDs}
        printOrders={printOrders}
        view={view}
        setView={setView}
        syncing={syncing}
        orderTagsList={orderTagsList}
      />

      {generatingPDF &&
        ReactDOM.createPortal(
          <div className="bg-white p-4 shadow-md overflow-hidden flex justify-start absolute w-[400px] right-8 top-8 rounded z-[1023948]">
            <div className="w-full h-[4px] bg-secondary absolute top-0 right-0" />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex justify-start items-center">
                <Info className="text-secondary mr-2" />
                <p className="text-lg font-medium">Printing Picklist...</p>
              </div>
              <p>Picklist is being generated</p>
            </div>
          </div>,
          document.body
        )}
      {openPrintModal &&
        activeOrders.length > 0 &&
        ReactDOM.createPortal(
          <div className="fixed top-0 right-0 bg-black/50 w-full h-full z-50 flex items-center justify-center">
            <div className="bg-white w-[1300px] overflow-hidden rounded shadow-lg">
              <div className="p-2 flex items-center justify-between shadow-default bg-gray-200 ">
                <h2 className="text-lg">Print Preview</h2>
                <Close className="hover:text-secondary" onClick={() => setOpenPrintModal(false)} />
              </div>
              <div className="grid grid-cols-[800px_1fr]">
                {pdfUrl && (
                  <iframe
                    src={`${pdfUrl}#zoom=50`}
                    width="100%"
                    height="650px"
                    style={{ border: '1px solid #ccc', display: 'block' }}
                  ></iframe>
                )}
                <div>
                  <div className="flex flex-col items-start w-full mt-4 px-2 gap-2 mb-4">
                    <label className="text-lg font-medium" htmlFor="printer">
                      Printer Selection
                    </label>
                    <DropDownContainer className={'w-full'} type="click">
                      <DropDownTrigger className="w-full border border-black justify-between">
                        {selectedPrinter?.alias || 'Select Printer'}
                      </DropDownTrigger>
                      <DropDownContent
                        style={{
                          width: '100%',
                        }}
                        className={'w-full'}
                      >
                        {printersList.map((printer, idx) => (
                          <DropDownItem
                            className={twMerge(
                              'flex items-center justify-between',
                              printer.name === selectedPrinter?.name ? 'bg-secondary/5' : ''
                            )}
                            onClick={() => setSelectedPrinter(printer)}
                            key={idx}
                          >
                            <span>
                              {printer.alias}{' '}
                              <span className="text-sm text-gray-500">
                                {printer.is_default ? '(Default)' : ''}
                              </span>
                            </span>
                            <span>
                              <button
                                className="flex text-[12px] text-black hover:text-secondary group items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markPrinterAsDefault(printer.name);
                                }}
                              >
                                Default
                                <span
                                  className={twMerge(
                                    'w-4 h-4 border flex items-center justify-center group-hover:border-secondary  rounded-[2px]',
                                    printer.is_default
                                      ? 'bg-secondary border-secondary'
                                      : 'border-black bg-white'
                                  )}
                                >
                                  {printer.is_default && <FaCheck className="text-white w-3 h-3" />}
                                </span>
                              </button>
                            </span>
                          </DropDownItem>
                        ))}
                      </DropDownContent>
                    </DropDownContainer>
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center justify-end p-2  border-t border-gray-200 gap-4">
                <button
                  className="hover:text-secondary border rounded border-black px-3 py-1 hover:border-secondary"
                  onClick={() => setOpenPrintModal(false)}
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedPrinter}
                  className="bg-secondary hover:bg-secondaryLight text-white rounded px-3 py-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={sendToPrinter}
                >
                  Print Picklist
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      <div
        style={{
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(100%)',
          height: '1px',
          overflow: 'hidden',
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }}
      >
        <PrintHtml ref={printRef} activeOrders={activeOrders} />
      </div>
    </div>
  );
}

export default ShipstationPickList;
