import React, { useContext, useEffect, useState } from "react";
import "../css/admin.css";
import { useDispatch, useSelector } from "react-redux";
import DeleteModal from "../../modals/deleteModal";
import AdminRegister from "../../modals/adminRegister";
import AdminEditUser from "../../modals/adminEditUser";
import Webhooks from "./components/webhooks";
import { CreateWebhook, UpdateWebhook } from "./components/modals";
import UserTable from "./components/user-table";
import { BreakpointsContext } from "../../../context/BreakpointsContext";

function WallyB() {
  const dispatch = useDispatch();
  const breakpoint = useContext(BreakpointsContext);
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
  const [webhookModalActive, setWebhookModalActive] = useState(false);
  const [updateWebhookModalActive, setUpdateWebhookModalActive] =
    useState(false);
  const [activeWebhook, setActiveWebhook] = useState({});

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
      <div className="my-4 px-4 opacity-0 animate-in flex flex-col max-w-screen-xl w-full mx-auto gap-8">
        <h1 className="font-bold text-4xl">Admin Dashboard</h1>
        <UserTable
          props={{
            users,
            currentUser,
            setRegisterFormActive,
            setEditUserActive,
            setUsername,
            setRole,
            setSelectedUserId,
            setDeleteModalActive,
            breakpoint,
          }}
        />
        <Webhooks
          props={{
            webhooks,
            setOpen: setWebhookModalActive,
            setUpdateOpen: setUpdateWebhookModalActive,
            setActiveWebhook,
            breakpoint,
          }}
        />
      </div>
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
      <UpdateWebhook
        props={{
          webhook: activeWebhook,
          setActiveWebhook,
          open: updateWebhookModalActive,
          setOpen: setUpdateWebhookModalActive,
        }}
      />
    </>
  );
}

export default WallyB;
