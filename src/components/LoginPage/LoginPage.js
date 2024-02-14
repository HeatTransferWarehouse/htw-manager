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
      <img
        src="https://res.cloudinary.com/heattransferwarehouse/image/upload/c_scale,q_35,w_600/v1701704613/HTW%20Home/HTW_logo_2023.avif"
        alt=""
        className="htw-logo"
      />
      <form onSubmit={loginEvent} className="login-container">
        <h2>HTW Admin Login</h2>
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
