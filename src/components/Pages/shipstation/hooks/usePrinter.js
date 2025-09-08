import { useState } from 'react';
import { getLocalPrinters } from '../utils/utils';
import { useDispatch } from 'react-redux';

export default function usePrinter(
  printRef,
  conversionRef,
  activeOrders,
  dispatch,
  limit,
  view,
  search,
  page,
  setActiveOrders
) {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [printersList, setPrintersList] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [savedPDFBlob, setSavedPDFBlob] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [type, setType] = useState(''); // 'picklist' or 'conversion'

  /** ✅ Inline all CSS so the print server sees styled HTML */
  const getInlineStyledHtml = (element) => {
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
  };

  /** ✅ Generate PDF from the hidden ref */
  const generatePDF = async (printType) => {
    const ref = printType === 'conversion' ? conversionRef.current : printRef.current;

    if (!ref) {
      setGeneratingPDF(false);
      return;
    }

    try {
      setGeneratingPDF(true);

      // Get printers
      const printersResponse = await getLocalPrinters(dispatch);
      if (printersResponse?.printers?.length) {
        setPrintersList(printersResponse.printers);
        const defaultPrinter = printersResponse.printers.find((p) => p.is_default);
        setSelectedPrinter(defaultPrinter || printersResponse.printers[0]);
      }

      // Inline HTML
      const htmlBody = getInlineStyledHtml(ref);
      const html = `<!DOCTYPE html><html><body>${htmlBody}</body></html>`;

      // Call Python print server
      const response = await fetch('http://localhost:4577/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
        mode: 'cors',
      });

      if (!response.ok) {
        const text = await response.text();
        dispatch({
          type: 'SET_ORDERS_ERROR',
          payload: {
            title: 'PDF Generation Error',
            message: text || 'An error occurred while generating the PDF.',
          },
        });
        return;
      }

      const blob = await response.blob();
      setSavedPDFBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setOpenPrintModal(true);
    } catch (err) {
      console.error('generatePDF error:', err);
    } finally {
      setGeneratingPDF(false);
    }
  };

  /** ✅ Entry point to start printing flow */
  const printOrders = async (type) => {
    generatePDF(type);
  };

  /** ✅ Mark printer as default */
  const markPrinterAsDefault = async (printerName) => {
    try {
      const response = await fetch('http://localhost:4577/printers/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printer: printerName }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const updatePrinters = await getLocalPrinters(dispatch);
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

  /** ✅ Send PDF blob to selected printer */
  const sendToPrinter = async () => {
    try {
      setIsPrinting(true);
      const formData = new FormData();
      formData.append('pdf', savedPDFBlob);
      formData.append('printerName', selectedPrinter?.name);

      const response = await fetch(`http://localhost:4577/print-pdf`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        if (type === 'picklist') {
          dispatch({
            type: 'MARK_ORDERS_PRINTED',
            payload: {
              orderIds: activeOrders.map((o) => o.order_id),
              limit,
              filter: view,
              search,
              page,
            },
          });
        }
        setOpenPrintModal(false);
        setSelectedPrinter('');
      } else {
        dispatch({
          type: 'SET_ORDERS_ERROR',
          payload: {
            title: 'Error Connecting to Print Server',
            message:
              err.message ||
              'An Error occurred when attempting to connect to print server. Please ensure the print server is running on your machine.',
          },
        });
      }
    } catch (err) {
      dispatch({
        type: 'SET_ORDERS_ERROR',
        payload: {
          title: 'Error Connecting to Print Server',
          message:
            err.message ||
            'An Error occurred when attempting to connect to print server. Please ensure the print server is running on your machine.',
        },
      });
    } finally {
      setIsPrinting(false);
      setActiveOrders([]);
      setType('');
    }
  };

  return {
    generatingPDF,
    openPrintModal,
    pdfUrl,
    printersList,
    selectedPrinter,
    setSelectedPrinter,
    setOpenPrintModal,
    printOrders,
    sendToPrinter,
    markPrinterAsDefault,
    isPrinting,
    type,
    setType,
  };
}
