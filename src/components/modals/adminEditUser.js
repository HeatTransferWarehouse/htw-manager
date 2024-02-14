import React from "react";

export default function AdminEditUser(props) {
  return (
    <>
      <div className="edit-user-modal">
        <form className="formPanel" onSubmit={props.editUser}>
          <h2>Edit User</h2>
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
                  placeholder="Enter current or new password"
                  onChange={(event) => props.setPassword(event.target.value)}
                />
              </label>
            </div>
            {props.currentUser.id !== props.selectedUserId && (
              <div className="form-group">
                <label htmlFor="role">
                  Role:
                  <select
                    className="form-control"
                    name="role"
                    value={props.role}
                    required
                    onChange={(event) => props.setRole(event.target.value)}>
                    <option value="5">Admin</option>
                    <option value="0">Staff</option>
                  </select>
                </label>
              </div>
            )}
          </div>
          <div className="form-group">
            <button
              onClick={(e) => {
                e.preventDefault();
                props.setEditUserActive(false);
              }}
              className="edit-user-close">
              Cancel
            </button>
            <input
              className="edit-user-save"
              type="submit"
              name="submit"
              value="Save Changes"
            />
          </div>
        </form>
      </div>
    </>
  );
}
