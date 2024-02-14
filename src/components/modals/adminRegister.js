import React from "react";

export default function AdminRegister(props) {
  return (
    <>
      <div className="register-user-modal">
        <form className="formPanel" onSubmit={props.registerUser}>
          <h2>Register</h2>
          <div className="form-inputs">
            <div className="form-group">
              <label htmlFor="username">
                Username:
                <input
                  className="form-control"
                  type="text"
                  name="username"
                  value={props.username}
                  required
                  onChange={(event) => props.setUsername(event.target.value)}
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
                  value={props.password}
                  required
                  onChange={(event) => props.setPassword(event.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="form-group">
            <button
              onClick={(e) => {
                e.preventDefault();
                props.setRegisterFormActive(false);
              }}
              className="register-user-close">
              Cancel
            </button>
            <input
              className="register-user-add"
              type="submit"
              name="submit"
              value="Register"
            />
          </div>
        </form>
      </div>
    </>
  );
}
