import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // import useNavigate for redirection
import { twMerge } from "tailwind-merge";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize navigate
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const logInStatus = useSelector((store) => store.error.loginMessage);
  const user = useSelector((store) => store.user.userReducer); // Get user data from Redux store

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

  // Effect to handle redirection after successful login
  useEffect(() => {
    if (user.id) {
      navigate("/"); // Redirect to main page if user is logged in
    }
  }, [user, navigate]); // Trigger redirection when user state changes

  return (
    <div className="flex fixed top-0 left-0 w-full justify-center items-center h-full z-[99999] bg-black">
      <form
        onSubmit={loginEvent}
        className="flex flex-col justify-center items-center w-full max-w-[325px]">
        <div className="flex items-center justify-center flex-col">
          <img
            src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/htw-admin-favicon-purple.png?t=1685116764"
            alt=""
            className="w-[100px]"
          />
          <h2 className="text-white font-bold text-3xl">HTW Admin Login</h2>
        </div>
        <div className="w-full mt-8 flex flex-col gap-4">
          <div>
            <label
              className="text-white font-medium mb-2 text-left flex w-full"
              htmlFor="username">
              EMAIL / USERNAME
            </label>
            <input
              className={twMerge(
                logInStatus ? "border-red-600" : "border-white",
                "bg-white m-0 text-base text-black border-2 border-solid p-2 w-full rounded-md"
              )}
              type="text"
              name="username"
              value={username}
              required
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <label
              className="text-white font-medium mb-2 text-left flex w-full"
              htmlFor="password">
              PASSWORD
            </label>
            <input
              className={twMerge(
                logInStatus ? "border-red-600" : "border-white",
                "bg-white border-2 border-solid text-base border-white text-black m-0 p-2 w-full rounded-md"
              )}
              type="password"
              name="password"
              value={password}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>
        {logInStatus && <p className="text-red-600">{logInStatus}</p>}
        <button
          className="bg-gradient-to-r mt-8 transition duration-200 bg-secondary rounded-md  w-full py-3 text-white flex items-center justify-center "
          type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
