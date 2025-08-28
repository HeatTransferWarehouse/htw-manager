import React, { useCallback, useEffect, useRef } from 'react';
import '../../../src/output.css';
import '../../assets/styles/main.scss';
import './App.css';
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Nav from '../Nav/Nav';
import Register from '../RegisterForm/RegisterForm';
import Main from '../Home/Main';
import Resources from '../Pages/Resources';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import AdminRoute from '../ProtectedRoute/AdminRoute';
import Admin from '../Pages/Admin/Admin';
import Login from '../LoginPage/LoginPage';
import Supacolor from '../Pages/Supacolor';
import DecoQueue from '../Pages/DecoQueue/DecoQueue';
import OrderLookupOLD from '../Pages/OrderLookupOLD';
import SFFQueue from '../Pages/SffQueue/SFFQueue';
import ClothingQueue from '../Pages/ClothingQueue/page';
import HeroBannerCodeGenerator from '../Pages/HeroCodeGenerator/HeroBannerCodeGenerator';
import FaqCodeGenerator from '../Pages/FaqCodeGenerator/page';
import Account from '../Pages/Account/account';
import { useDispatch, useSelector } from 'react-redux';
import ProductsWithNoDesc from '../Pages/ProductsWithNoDescription';
import ProductsMissingAlts from '../Pages/ProductsMissingAlt';
import ProductTools from '../Pages/ProductTools';
import RhineStoneMockUp from '../Pages/RhinestoneMockUp/page';
import { twMerge } from 'tailwind-merge';
import JDSProductCreation from '../Pages/JDS/ProductCreation/page';
import PageNotFound from '../Pages/404/page';
import ShipstationPickList from '../Pages/shipstation/pick-list/page';

// App.js
export const routeConfig = [
  { path: '/login', name: 'Login', element: <Login />, protected: false },
  { path: '/', name: 'Home', element: <Main />, protected: true },
  {
    path: '/sff-queue',
    name: 'SFF Queue',
    element: <SFFQueue />,
    protected: true,
    page_title: 'SFF Queue',
  },
  {
    path: '/rhinestone-mockup',
    name: 'Rhinestone Mockup',
    element: <RhineStoneMockUp />,
    protected: false,
    page_title: 'Rhinestone Mockup',
  },
  {
    path: '/products/missing-alts',
    name: 'Products Missing Alt Tags',
    element: <ProductsMissingAlts />,
    protected: true,
    page_title: 'Products Missing Alt Tags',
  },
  {
    path: '/resources',
    name: 'Resources',
    element: <Resources />,
    protected: true,
    page_title: 'Resources',
  },
  {
    path: '/decoqueue',
    name: 'DecoQueue',
    element: <DecoQueue />,
    protected: true,
    page_title: 'DecoQueue',
  },
  {
    path: '/supacolor',
    name: 'Supacolor',
    element: <Supacolor />,
    protected: true,
    page_title: 'Supacolor',
  },
  {
    path: '/hero-code-generator',
    name: 'Hero Code Generator',
    element: <HeroBannerCodeGenerator />,
    protected: true,
    page_title: 'Hero Banner Code Generator',
  },
  {
    path: '/faq-code-generator',
    name: 'FAQ Code Generator',
    element: <FaqCodeGenerator />,
    protected: true,
    page_title: 'FAQ Code Generator',
  },
  {
    path: '/product-tools',
    name: 'Product Tools',
    element: <ProductTools />,
    protected: true,
    page_title: 'Product Tools',
  },
  {
    path: '/queue/clothing',
    name: 'Clothing Queue',
    element: <ClothingQueue />,
    protected: true,
    page_title: 'Clothing Queue',
  },
  {
    path: '/orderlookupold',
    name: 'Order Lookup OLD',
    element: <OrderLookupOLD />,
    protected: false,
    page_title: 'Order Lookup OLD',
  },
  {
    path: '/account',
    name: 'Account',
    element: <Account />,
    protected: true,
    page_title: 'Account',
  },
  {
    path: '/register',
    name: 'Register',
    element: <Register />,
    protected: 'admin',
    page_title: 'Register',
  },
  {
    path: '/admin',
    name: 'Admin',
    element: <Admin />,
    protected: 'admin',
    page_title: 'Admin',
  },
  {
    path: '/products/no-description',
    name: 'Products With No Descriptions',
    element: <ProductsWithNoDesc />,
    protected: true,
    page_title: 'Products With No Descriptions',
  },
  {
    path: '/jds/new-product',
    name: 'JDS Product Creation',
    element: <JDSProductCreation />,
    protected: true,
    page_title: 'JDS Product Creation',
  },
  {
    path: '/shipstation/pick-list',
    name: 'Shipstation Pick List',
    element: <ShipstationPickList />,
    protected: true,
    page_title: 'Shipstation Pick List',
  },
];

function App() {
  const dispatch = useDispatch();
  const logoutTimerRef = useRef(null);
  const user = useSelector((store) => store.user.userReducer);
  const defaultUserPath = user.default_page || '/';
  const location = useLocation();

  const resetTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    logoutTimerRef.current = setTimeout(() => {
      dispatch({ type: 'UNSET_USER' });
    }, 1800000); // 30 minutes
  }, [dispatch]);

  useEffect(() => {
    dispatch({ type: 'FETCH_USER' });

    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhProperty();
    window.addEventListener('resize', setVhProperty);

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('touchmove', resetTimer);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchmove', resetTimer);
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [dispatch, resetTimer]);

  useEffect(() => {
    document.querySelector('.main-container').scrollTo(0, 0);
  }, [location]);

  const currentPage = routeConfig.find((route) => route.path === location.pathname);

  return (
    <>
      {user.id && location.pathname !== '/rhinestone-mockup' && <Nav />}

      <main
        className={twMerge(
          'main-container',
          currentPage?.path === '/rhinestone-mockup' && 'rhinestone-mockup'
        )}
      >
        <Routes>
          {/* Redirect to user's default path if logged in and visiting "/login" */}
          <Route
            path="/login"
            element={user.id ? <Navigate to={defaultUserPath} replace /> : <Login />}
          />

          <Route
            path="/account"
            element={<ProtectedRoute element={<Account user={user} routes={routeConfig} />} />}
          />

          {routeConfig.map((route) => {
            if (!route || typeof route.path === 'undefined') return null;
            const { path, element, protected: isProtected } = route;
            if (isProtected === true) {
              return (
                <Route key={path} path={path} element={<ProtectedRoute element={element} />} />
              );
            } else if (isProtected === 'admin') {
              return <Route key={path} path={path} element={<AdminRoute element={element} />} />;
            }
            return <Route key={path} path={path} element={element} />;
          })}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
