import { useDispatch } from "react-redux";

export const useAdminActions = () => {
  const dispatch = useDispatch();

  const deleteWebhook = async (id) => {
    dispatch({ type: "DELETE_WEBHOOK", payload: id });
  };

  const getWebhooks = async () => {
    dispatch({ type: "GET_WEBHOOKS" });
  };

  const createWebhook = async (webhook) => {
    dispatch({ type: "CREATE_WEBHOOK", payload: webhook });
  };

  return {
    deleteWebhook,
    getWebhooks,
    createWebhook,
  };
};
