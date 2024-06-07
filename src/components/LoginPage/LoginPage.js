import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./LoginPage.css";

export default function LoginPage() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const logInStatus = useSelector((store) => store.error.loginMessage);
  const loginEvent = (event) => {
    event.preventDefault();
    dispatch({
      type: "LOGIN",
      payload: {
        username: username,
        password: password,
      },
    });
  };

  return (
    <div className="login">
      <form onSubmit={loginEvent} className="login-container">
        <div>
          <img
            src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/htw-admin-favicon-purple.png?t=1685116764"
            alt=""
            className="htw-logo"
          />
          <h2>HTW Admin Login</h2>
        </div>
        <div className="login-inputs">
          <div className="login-input">
            {/* enter email address here */}
            <label htmlFor="username">EMAIL / USERNAME</label>
            <input
              className={logInStatus ? "login-error" : ""}
              type="text"
              name="username"
              value={username}
              required
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="login-input">
            <label htmlFor="password">PASSWORD</label>
            <input
              className={logInStatus ? "login-error" : ""}
              type="password"
              name="password"
              value={password}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>
        {logInStatus && <p className="error-message">{logInStatus}</p>}
        <button className="log-in" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
