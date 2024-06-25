import React, { useEffect, useState } from "react";
import "../css/admin.css";
import { useDispatch, useSelector } from "react-redux";
import { TiUserAdd } from "react-icons/ti";
import { FaUserEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import DeleteModal from "../../modals/deleteModal";
import AdminRegister from "../../modals/adminRegister";
import { MdEdit } from "react-icons/md";
import AdminEditUser from "../../modals/adminEditUser";
import Webhooks from "./components/webhooks";
import { CreateWebhook } from "./components/modals";

function WallyB() {
  const dispatch = useDispatch();
  const users = useSelector((store) => store.user.allUsersReducer);
  const webhooks = useSelector((store) => store.admin.webhooks);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const currentUser = useSelector((store) => store.user.userReducer);
  const [registerFormActive, setRegisterFormActive] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [editUserActive, setEditUserActive] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [webhookModalActive, setWebhookModalActive] = useState(true);
  useEffect(() => {
    dispatch({ type: "FETCH_ALL_USERS" });
    dispatch({ type: "GET_WEBHOOKS" });
  }, [dispatch]);

  // const errors = useSelector((store) => store.errors);
  const registerUser = (event) => {
    event.preventDefault();

    dispatch({
      type: "REGISTER",
      payload: {
        username: username,
        password: password,
      },
    });
    setUsername("");
    setPassword("");
    setRegisterFormActive(false);
  }; // end registerUser

  const editUser = (event) => {
    event.preventDefault();

    dispatch({
      type: "UPDATE_USER",
      payload: {
        id: selectedUserId,
        username: username,
        password: password,
        role: role,
      },
    });
    setSelectedUserId(null);
    setUsername("");
    setPassword("");
    setRole(null);
    setEditUserActive(false);
  };

  return (
    <>
      <main className="my-4 flex flex-col max-w-screen-xl w-full mx-auto gap-8">
        <div className="admin-header">
          <h1>Admin Controls</h1>
        </div>
        <div className="bg-white rounded-md shadow-default w-full p-4 max-w-screen-xl">
          <div className="admin-users-section-header">
            <h2>
              Active Users{" "}
              <span className="active-users">({users.length - 1})</span>
            </h2>
            <div className="admin-users-header-buttons">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRegisterFormActive(true);
                }}
                className="admin-users-add">
                New User
                <TiUserAdd className="admin-add-user-icon" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditUserActive(true);
                  setUsername(currentUser.email);
                  setRole(currentUser.access_level);
                  setSelectedUserId(currentUser.id);
                }}
                className="admin-users-add">
                Edit My Info
                <MdEdit className="admin-edit-admin-icon" />
              </button>
            </div>
          </div>
          <div className="admin-users">
            <div className="admin-users-header">
              <p className="admin-users-email">Email</p>
              <p className="admin-users-role">Role</p>
              <p className="empty-column"></p>
              <p className="empty-column"></p>
            </div>
            {users.map((user) => {
              if (user.id === currentUser.id) {
                return null;
              } else {
                return (
                  <div className="admin-user" key={user.id}>
                    <p className="admin-user-email">{user.email}</p>
                    <p className="admin-user-role">
                      {user.access_level === "5" ? "Admin" : "Staff"}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setUsername(user.email);
                        setRole(user.access_level);
                        setEditUserActive(true);
                      }}
                      className="admin-edit-user">
                      <FaUserEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setDeleteModalActive(true);
                      }}
                      className="admin-delete-user">
                      <FaTrash />
                    </button>
                  </div>
                );
              }
            })}
          </div>
        </div>
        <Webhooks props={{ webhooks }} />
      </main>
      {registerFormActive && (
        <AdminRegister
          registerUser={registerUser}
          setRegisterFormActive={setRegisterFormActive}
          username={username}
          setUsername={setUsername}
          setPassword={setPassword}
          password={password}
        />
      )}
      {deleteModalActive && (
        <DeleteModal
          selectedUserId={selectedUserId}
          setDeleteModalActive={setDeleteModalActive}
          setSelectedUserId={setSelectedUserId}
        />
      )}
      {editUserActive && (
        <AdminEditUser
          currentUser={currentUser}
          selectedUserId={selectedUserId}
          editUser={editUser}
          setEditUserActive={setEditUserActive}
          username={username}
          password={password}
          role={role}
          setUsername={setUsername}
          setPassword={setPassword}
          setRole={setRole}
        />
      )}
      <CreateWebhook
        props={{
          open: webhookModalActive,
          setOpen: setWebhookModalActive,
        }}
      />
    </>
  );
}

export default WallyB;
