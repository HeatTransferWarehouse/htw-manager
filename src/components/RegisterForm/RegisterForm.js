import React, { useState } from "react";
import { useDispatch } from "react-redux";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const errors = useSelector((store) => store.errors);
  const dispatch = useDispatch();

  const registerUser = (event) => {
    event.preventDefault();

    dispatch({
      type: "REGISTER",
      payload: {
        username: username,
        password: password,
      },
    });
  }; // end registerUser

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <form className="formPanel" onSubmit={registerUser}>
        <h2>Register</h2>
        {/* {errors.registrationMessage && (
                <h3 className="alert" role="alert">
                    {errors.registrationMessage}
                </h3>
            )} */}
        <div className="form-inputs">
          <div className="form-group">
            <label htmlFor="username">
              Username:
              <input
                className="form-control"
                type="text"
                name="username"
                value={username}
                required
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Password:
              <input
                className="form-control"
                type="password"
                name="password"
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="form-group">
          <input
            className="btn btn-outline-success"
            type="submit"
            name="submit"
            value="Register"
          />
        </div>
      </form>
    </>
  );
}

export default RegisterForm;
