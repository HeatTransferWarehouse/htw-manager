import React, { useContext, useEffect, useState } from "react";
import "../css/admin.css";
import { useDispatch, useSelector } from "react-redux";
import DeleteModal from "../../modals/deleteModal";
import Webhooks from "./components/webhooks";
import {
  CreateWebhook,
  RegisterUser,
  UpdateUser,
  UpdateWebhook,
} from "./components/modals";
import UserTable from "./components/user-table";
import { BreakpointsContext } from "../../../context/BreakpointsContext";

function WallyB() {
  const dispatch = useDispatch();
  const breakpoint = useContext(BreakpointsContext);
  const users = useSelector((store) => store.user.allUsersReducer);
  const webhooks = useSelector((store) => store.admin.webhooks);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedWebhookId, setSelectedWebhookId] = useState(null);
  const currentUser = useSelector((store) => store.user.userReducer);
  const [registerFormActive, setRegisterFormActive] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [editUserActive, setEditUserActive] = useState(false);
  const [user, setUser] = useState({});
  const [webhookModalActive, setWebhookModalActive] = useState(false);
  const [updateWebhookModalActive, setUpdateWebhookModalActive] =
    useState(false);
  const [activeWebhook, setActiveWebhook] = useState({});

  useEffect(() => {
    dispatch({ type: "FETCH_ALL_USERS" });
    dispatch({ type: "GET_WEBHOOKS" });
  }, [dispatch]);

  const deleteUser = () => {
    dispatch({
      type: "DELETE_USER",
      payload: selectedUserId,
    });
    setDeleteModalActive(false);
    setSelectedUserId(null);
  };

  const deleteWebhook = () => {
    console.log("running");
    dispatch({
      type: "DELETE_WEBHOOK",
      payload: selectedWebhookId,
    });

    setDeleteModalActive(false);
    setSelectedWebhookId(null);
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
            setUser,
            breakpoint,
            setSelectedUserId,
            setDeleteModalActive,
          }}
        />
        <Webhooks
          props={{
            webhooks,
            setOpen: setWebhookModalActive,
            setUpdateOpen: setUpdateWebhookModalActive,
            setActiveWebhook,
            setSelectedWebhookId,
            setDeleteModalActive,
            breakpoint,
          }}
        />
      </div>
      <RegisterUser
        props={{
          open: registerFormActive,
          setOpen: setRegisterFormActive,
        }}
      />
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
      <UpdateUser
        props={{
          open: editUserActive,
          setOpen: setEditUserActive,
          user,
          setUser,
        }}
      />
      <DeleteModal
        props={{
          open: deleteModalActive,
          setOpen: setDeleteModalActive,
          deleteFunction: selectedUserId ? deleteUser : deleteWebhook,
          setId: selectedUserId ? setSelectedUserId : setSelectedWebhookId,
        }}
      />
    </>
  );
}

export default WallyB;
