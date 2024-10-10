import React, { useCallback, useEffect, useRef } from "react";
import "../../../src/output.css";
import "../../assets/styles/main.scss";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
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
import OrderLookup from "../Pages/OrderLookup";
import OrderLookupOLD from "../Pages/OrderLookupOLD";
import SFFQueue from "../Pages/SffQueue/SFFQueue";
import ClothingQueue from "../Pages/ClothingQueue/page";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import Promotions from "../Pages/Promos";
import PromoDetails from "../Pages/Promos/individualIndex";

function App() {
  const dispatch = useDispatch();
  const logoutTimerRef = useRef(null);
  const user = useSelector((store) => store.user.userReducer);

  const resetTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    logoutTimerRef.current = setTimeout(() => {
      dispatch({ type: "UNSET_USER" });
    }, 300000); // 300,000ms = 5 min
  }, [dispatch]);

  useEffect(() => {
    // Initially fetch the user
    dispatch({ type: "FETCH_USER" });

    // Function to set the --vh custom property
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Initial calculation
    setVhProperty();

    window.addEventListener("resize", setVhProperty);

    // Set up the initial timeout
    // Set up event listeners for various user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchmove", resetTimer);

    // Cleanup function to remove the event listeners and clear the timeout
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
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute element={<Main />} />} />
          <Route
            path="/sff-queue"
            element={<ProtectedRoute element={<SFFQueue />} />}
          />
          <Route
            path="/resources"
            element={<ProtectedRoute element={<Resources />} />}
          />
          <Route
            path="/decoqueue"
            element={<ProtectedRoute element={<DecoQueue />} />}
          />
          <Route
            path="/supacolor"
            element={<ProtectedRoute element={<Supacolor />} />}
          />
          <Route
            path="/queue/clothing"
            element={<ProtectedRoute element={<ClothingQueue />} />}
          />

          {/* Admin Routes */}
          <Route path="/wallyb" element={<AdminRoute element={<WallyB />} />} />
          <Route
            path="/register"
            element={<AdminRoute element={<Register />} />}
          />
          <Route path="/admin" element={<AdminRoute element={<Admin />} />} />

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
