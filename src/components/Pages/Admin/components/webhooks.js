import React from "react";
import { GoDotFill } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

export default function Webhooks({ props }) {
  return (
    <Card width={"xl"}>
      <div className="flex items-center max-md:flex-col max-md:gap-4 justify-between mb-4">
        <h2 className="font-bold text-2xl">
          Webhooks{" "}
          <span className="text-lg text-gray-700 font-normal">
            ({props.webhooks?.length})
          </span>
        </h2>
        <Button onClick={() => props.setOpen(true)} variant={"secondary"}>
          New Hook <FaPlus className="w-4 h-4 fill-white" />
        </Button>
      </div>
      {props.webhooks?.map((webhook, index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b border-gray-200 py-4">
          <div className="grow">
            <p className="text-lg w-fit max-md:text-base relative font-bold flex items-center gap-2">
              {webhook.scope}
              {webhook.is_active ? (
                <span className="w-4 h-4 flex absolute  -right-5 items-center justify-center border border-solid border-green-600 rounded-full">
                  <GoDotFill className="w-full h-full animate-pulse fill-green-600" />
                </span>
              ) : (
                <span className="w-4 h-4 flex absolute  -right-5 rounded-full items-center justify-center border border-solid border-red-600">
                  <GoDotFill className="w-3 h-3 fill-red-600" />
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500">
              {webhook.destination.split(".com/")[1]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className={"p-2"}
              onClick={() => {
                props.setActiveWebhook({
                  id: webhook.id,
                  scope: webhook.scope,
                  destination: webhook.destination,
                  isActive: webhook.is_active,
                  eventsHistoryEnabled: webhook.events_history_enabled,
                  headers: webhook.headers,
                });
                props.setUpdateOpen(true);
              }}
              variant={"neutral"}>
              {props.breakpoint === "mobile" ? (
                <MdEdit className="w-4 h-4 fill-black" />
              ) : (
                "Update"
              )}
            </Button>
            <Button
              className={"p-2"}
              onClick={() => {
                props.setSelectedWebhookId(webhook.id);
                props.setDeleteModalActive(true);
              }}
              variant={"danger"}>
              {props.breakpoint === "mobile" ? (
                <MdDelete className="w-4 h-4 fill-white" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
