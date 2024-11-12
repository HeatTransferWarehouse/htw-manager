import React, { useCallback, useEffect, useRef } from "react";
import "../../../src/output.css";
import "../../assets/styles/main.scss";
import "./App.css";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Nav from "../Nav/Nav";
import Register from "../RegisterForm/RegisterForm";
import Main from "../Home/Main";
import Resources from "../Pages/Resources";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import AdminRoute from "../ProtectedRoute/AdminRoute";
import WallyB from "../Pages/WallyB";
import Admin from "../Pages/Admin/Admin";
import Login from "../LoginPage/LoginPage";
import Supacolor from "../Pages/Supacolor";
import DecoQueue from "../Pages/DecoQueue/DecoQueue";
import OrderLookupOLD from "../Pages/OrderLookupOLD";
import SFFQueue from "../Pages/SffQueue/SFFQueue";
import ClothingQueue from "../Pages/ClothingQueue/page";
import Promotions from "../Pages/Promos";
import PromoDetails from "../Pages/Promos/individualIndex";
import HeroBannerCodeGenerator from "../Pages/HeroCodeGenerator/HeroBannerCodeGenerator";
import FaqCodeGenerator from "../Pages/FaqCodeGenerator/page";
import Account from "../Pages/Account/account";
import { useDispatch, useSelector } from "react-redux";

// App.js
export const routeConfig = [
  { path: "/login", name: "Login", element: <Login />, protected: false },
  { path: "/", name: "Home", element: <Main />, protected: true },
  {
    path: "/sff-queue",
    name: "SFF Queue",
    element: <SFFQueue />,
    protected: true,
    page_title: "SFF Queue",
  },
  {
    path: "/resources",
    name: "Resources",
    element: <Resources />,
    protected: true,
    page_title: "Resources",
  },
  {
    path: "/decoqueue",
    name: "DecoQueue",
    element: <DecoQueue />,
    protected: true,
    page_title: "DecoQueue",
  },
  {
    path: "/supacolor",
    name: "Supacolor",
    element: <Supacolor />,
    protected: true,
    page_title: "Supacolor",
  },
  {
    path: "/hero-code-generator",
    name: "Hero Code Generator",
    element: <HeroBannerCodeGenerator />,
    protected: true,
    page_title: "Hero Banner Code Generator",
  },
  {
    path: "/faq-code-generator",
    name: "FAQ Code Generator",
    element: <FaqCodeGenerator />,
    protected: true,
    page_title: "FAQ Code Generator",
  },
  {
    path: "/queue/clothing",
    name: "Clothing Queue",
    element: <ClothingQueue />,
    protected: true,
    page_title: "Clothing Queue",
  },
  {
    path: "/orderlookupold",
    name: "Order Lookup OLD",
    element: <OrderLookupOLD />,
    protected: true,
    page_title: "Order Lookup OLD",
  },
  {
    path: "/account",
    name: "Account",
    element: <Account />,
    protected: true,
    page_title: "Account",
  },
  {
    path: "/wallyb",
    name: "WallyB",
    element: <WallyB />,
    protected: "admin",
    page_title: "WallyB",
  },
  {
    path: "/register",
    name: "Register",
    element: <Register />,
    protected: "admin",
    page_title: "Register",
  },
  {
    path: "/admin",
    name: "Admin",
    element: <Admin />,
    protected: "admin",
    page_title: "Admin",
  },
];

function App() {
  const dispatch = useDispatch();
  const logoutTimerRef = useRef(null);
  const user = useSelector((store) => store.user.userReducer);
  const defaultUserPath = user.default_page || "/";

  const resetTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    logoutTimerRef.current = setTimeout(() => {
      dispatch({ type: "UNSET_USER" });
    }, 300000); // 300,000ms = 5 min
  }, [dispatch]);

  useEffect(() => {
    dispatch({ type: "FETCH_USER" });

    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVhProperty();
    window.addEventListener("resize", setVhProperty);

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchmove", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchmove", resetTimer);
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [dispatch, resetTimer]);

  return (
    <Router>
      {user.id && <Nav />}
      <main className="main-container">
        <Routes>
          {/* Redirect to user's default path if logged in and visiting "/login" */}
          <Route
            path="/login"
            element={
              user.id ? <Navigate to={defaultUserPath} replace /> : <Login />
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute
                element={<Account user={user} routes={routeConfig} />}
              />
            }
          />

          {routeConfig.map(({ path, element, protected: isProtected }) => {
            if (isProtected === true) {
              return (
                <Route
                  key={path}
                  path={path}
                  element={<ProtectedRoute element={element} />}
                />
              );
            } else if (isProtected === "admin") {
              return (
                <Route
                  key={path}
                  path={path}
                  element={<AdminRoute element={element} />}
                />
              );
            }
            return <Route key={path} path={path} element={element} />;
          })}

          {/* Catch-all 404 route */}
          <Route
            path="*"
            element={
              <>
                <h1 className="fourfour">404</h1>
              </>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
