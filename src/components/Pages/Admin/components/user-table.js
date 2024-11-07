import React from "react";
import { MdEdit } from "react-icons/md";
import { TiUserAdd } from "react-icons/ti";
import { MdDelete } from "react-icons/md";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";

export default function UserTable({ props }) {
  return (
    <Card>
      <div className="flex flex-col max-md:gap-4 md:flex-row items-center justify-between">
        <h2 className="font-bold text-2xl items-end flex gap-2">
          Active Users
          <span className="text-gray-600 text-lg font-normal">
            ({props.users.length - 1})
          </span>
        </h2>
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              props.setRegisterFormActive(true);
            }}
            variant={"secondary"}>
            New User
            <TiUserAdd className="fill-white w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              props.setEditUserActive(true);
              props.setUsername(props.currentUser.email);
              props.setRole(props.currentUser.access_level);
              props.setSelectedUserId(props.currentUser.id);
            }}
            variant={"secondary"}>
            Edit My Info
            <MdEdit className="w-4 h-4 fill-white" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-full mt-6">
        {props.breakpoint !== "mobile" && (
          <div className="grid gap-2 grid-cols-adminUserTable py-2 border-b border-solid border-gray-200">
            <p className="font-bold text-lg">Email</p>
            <p className="font-bold text-lg">Role</p>
            <p className="font-bold text-lg">Last Login</p>
            <p />
            <p />
          </div>
        )}
        {props.users.map((user) => {
          if (user.id === props.currentUser.id) {
            return null;
          } else {
            if (props.breakpoint === "mobile") {
              return (
                <div
                  className="w-full flex items-center gap-2 py-2 border-t border-solid border-gray-200 last-of-type:border-b"
                  key={user.id}>
                  <div className="flex grow flex-col">
                    <p className="flex items-center">{user.email}</p>
                    <p className="flex items-center">
                      {user.access_level === "5" ? "Admin" : "Member"}
                    </p>
                    <p className="flex items-center">
                      {user.last_login ? user.last_login.split("T")[0] : "N/A"}
                    </p>
                  </div>
                  <div className="w-fit flex gap-2">
                    <Button
                      className={"p-2"}
                      onClick={() => {
                        props.setUser({
                          id: user.id,
                          email: user.email,
                          password: user.password,
                          access_level: user.access_level,
                        });
                        props.setEditUserActive(true);
                      }}
                      variant={"neutral"}>
                      <MdEdit className="w-4 h-4 fill-black" />
                    </Button>
                    <Button
                      className={"p-2"}
                      onClick={() => {
                        props.setSelectedUserId(user.id);
                        props.setDeleteModalActive(true);
                      }}
                      variant={"danger"}>
                      <MdDelete className="h-4 w-4 fill-white" />
                    </Button>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  className="grid gap-2 grid-cols-adminUserTable py-2 border-b border-solid border-gray-200"
                  key={user.id}>
                  <p className="flex items-center">{user.email}</p>
                  <p className="flex items-center">
                    {user.access_level === "5" ? "Admin" : "Member"}
                  </p>
                  <p className="flex items-center">
                    {user.last_login ? user.last_login.split("T")[0] : "N/A"}
                  </p>

                  <Button
                    className={"w-full"}
                    onClick={() => {
                      props.setUser({
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        access_level: user.access_level,
                      });
                      props.setEditUserActive(true);
                    }}
                    variant={"neutral"}>
                    Edit
                  </Button>
                  <Button
                    className={"w-full"}
                    onClick={() => {
                      props.setSelectedUserId(user.id);
                      props.setDeleteModalActive(true);
                    }}
                    variant={"danger"}>
                    Delete
                  </Button>
                </div>
              );
            }
          }
        })}
      </div>
    </Card>
  );
}
