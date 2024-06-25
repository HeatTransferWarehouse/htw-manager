import React from "react";
import { GoDotFill } from "react-icons/go";

export default function Webhooks({ props }) {
  console.log(props.webhooks);
  return (
    <div className="bg-white mx-auto w-full p-4 rounded-md shadow-default max-w-screen-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-2xl">
          Webhooks{" "}
          <span className="text-lg text-gray-700 font-normal">
            ({props.webhooks?.length})
          </span>
        </h2>
      </div>
      {props.webhooks?.map((webhook, index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b border-gray-200 py-4">
          <div>
            <p className="text-lg font-bold flex items-center gap-2">
              {webhook.scope}
              {webhook.is_active ? (
                <span className="w-4 h-4 flex items-center justify-center border border-solid border-green-600 rounded-full">
                  <GoDotFill className="w-full h-full animate-pulse fill-green-600" />
                </span>
              ) : (
                <span className="w-4 h-4 flex rounded-full items-center justify-center border border-solid border-red-600">
                  <GoDotFill className="w-3 h-3 fill-red-600" />
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500">
              {webhook.destination.split(".com/")[1]}
            </p>
          </div>
          <div>
            <button className="p-2 bg-red-600 text-white rounded-md">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
