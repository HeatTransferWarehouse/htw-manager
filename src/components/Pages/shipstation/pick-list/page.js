import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrdersTable from '../components/orders-table';
import '../styles.css';
import ReactDOM from 'react-dom';
import PrintHtml from '../components/print-html';
import { Info } from '@material-ui/icons';
import { calculateOrderAges } from '../utils/utils';
import { useLocation } from 'react-router-dom';
import usePrinter from '../hooks/usePrinter';
import PrintModal from '../components/print-modal';

function ShipstationPickList() {
  const printRef = useRef();
  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);

  const view = searchParams.get('view') || 'all'; // Default to 'new' if no parameter
  const ordersStore = useSelector((state) => state.BC.orders.orders);
  const syncing = useSelector((state) => state.BC.orders.syncing);
  const orderTags = useSelector((state) => state.BC.orders.tags);

  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [orderTagsList, setOrdersTagsList] = useState(orderTags || []);
  const [activeOrders, setActiveOrders] = useState([]);
  const [expandedOrderIDs, setExpandedOrderIDs] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const {
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
  } = usePrinter(printRef, activeOrders, dispatch);

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
    dispatch({ type: 'GET_ORDERS', payload: { page: page + 1, limit: rowsPerPage } });
  }, [page, rowsPerPage, dispatch]);

  useEffect(() => {
    dispatch({ type: 'GET_ORDER_TAGS' });
  }, [dispatch]);

  useEffect(() => {
    dispatch({
      type: 'GET_ORDERS',
      payload: { page: page + 1, limit: rowsPerPage, filter: view },
      // 👆 backend is 1-based, your state is 0-based
    });
  }, [page, rowsPerPage, dispatch, view]);

  useEffect(() => {
    if (ordersStore?.orders) {
      setOrders(calculateOrderAges(ordersStore.orders));
    }
    setOrdersCount(ordersStore.pagination?.totalOrders || 0);
  }, [ordersStore, currentTime]);

  useEffect(() => {
    setOrdersTagsList(orderTags);
  }, [orderTags]);

  return (
    <div>
      <OrdersTable
        ordersData={orders}
        activeOrders={activeOrders}
        setActiveOrders={setActiveOrders}
        expandedOrderIDs={expandedOrderIDs}
        setExpandedOrderIDs={setExpandedOrderIDs}
        printOrders={printOrders}
        view={view}
        syncing={syncing}
        orderTagsList={orderTagsList}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        page={page}
        setPage={setPage}
        ordersCount={ordersCount}
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
      <PrintModal
        open={openPrintModal}
        generatingPDF={generatingPDF}
        pdfUrl={pdfUrl}
        printersList={printersList}
        selectedPrinter={selectedPrinter}
        setSelectedPrinter={setSelectedPrinter}
        markPrinterAsDefault={markPrinterAsDefault}
        sendToPrinter={sendToPrinter}
        onClose={() => setOpenPrintModal(false)}
      />
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
