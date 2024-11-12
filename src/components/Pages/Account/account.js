import React, { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import {
  Fieldset,
  Form,
  Input,
  Label,
  Option,
  OptionSheet,
  Select,
} from "../../Form/form";
import { Button } from "../../ui/button";
import { useDispatch } from "react-redux";
import { ToolTip, ToolTipIcon, ToolTipPanel } from "../../ui/tooltip";

export default function Account({ user, routes }) {
  const dispatch = useDispatch();
  const [initialSelectedPage, setInitialSelectedPage] = useState(null);
  const [initialSelectedTheme, setInitialSelectedTheme] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState();
  const [defaultSelectOpen, setDefaultSelectOpen] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const isAdmin = user.access_level === "5";

  // Initialize initialSelectedPage and initialSelectedTheme from user prop on mount
  useEffect(() => {
    setInitialSelectedPage(user.default_page);
    setSelectedPage(user.default_page);
  }, [user]);

  // Update selectedTitle based on routes when selectedPage changes
  useEffect(() => {
    const selectedRoute = routes.find((route) => route.path === selectedPage);
    if (selectedRoute) {
      setSelectedTitle(selectedRoute.page_title || "Home");
    }
  }, [selectedPage, routes]);

  // Handle changesMade state based on initial values
  useEffect(() => {
    setChangesMade(initialSelectedPage !== selectedPage);
  }, [initialSelectedPage, selectedPage]);

  // Handle beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (changesMade) {
        event.preventDefault();
        event.returnValue = ""; // Required for some browsers to show confirmation dialog
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [changesMade]);

  const openSelectDrawer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDefaultSelectOpen(!defaultSelectOpen);
  };

  const submitAccountChanges = (e) => {
    e.preventDefault();
    dispatch({
      type: "UPDATE_USER_PREFERENCES",
      payload: {
        id: user.id,
        path: selectedPage,
      },
    });
    setChangesMade(false);
    setInitialSelectedPage(selectedPage);
  };

  return (
    <>
      <h1>Account</h1>
      <Card className="mx-auto w-full" width={"sm"}>
        <h2 className="font-semibold text-xl flex items-center gap-2">
          Account Information
          <ToolTip>
            <ToolTipIcon />
            <ToolTipPanel size={"sm"}>
              Contact Admin to change email or password
            </ToolTipPanel>
          </ToolTip>
        </h2>
        <Form onSubmit={submitAccountChanges} className="mt-8">
          <Fieldset className="flex-row gap-4 justify-between items-center">
            <Label htmlFor="email">Email</Label>
            <Input
              title="Contact Admin to change email"
              type="email"
              className="w-3/4"
              id="email"
              name="email"
              value={user.email}
              disabled
            />
          </Fieldset>
          <Fieldset className="flex-row gap-4 justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Input
              className="w-3/4"
              title="Contact Admin to change password"
              type="password"
              id="password"
              name="password"
              value={"Contact Admin to change password"}
              disabled
            />
          </Fieldset>
          <Fieldset className="flex-row gap-4 justify-between items-center">
            <Label htmlFor="default_page">Default Page</Label>
            <Select
              className="w-3/4"
              id="default_page"
              name="Default Page"
              onChange={(e) => setSelectedPage(e.target.value)}
              onClick={openSelectDrawer}
              open={defaultSelectOpen}
              setOpen={setDefaultSelectOpen}
              selectedLabel={selectedTitle}
              value={selectedPage}>
              <OptionSheet className="!w-full" open={defaultSelectOpen}>
                {routes.map((route) => {
                  if (!isAdmin && route.protected === "admin") {
                    return null;
                  }

                  if (
                    route.path === "/login" ||
                    route.path === "/register" ||
                    route.path === "/orderlookupold"
                  ) {
                    return null;
                  }

                  return (
                    <Option
                      onClick={() => {
                        setSelectedPage(route.path);
                        setDefaultSelectOpen(false);
                        setSelectedTitle(
                          route.page_title ? route.page_title : "Home"
                        );
                      }}
                      selectedValue={selectedPage}
                      value={route.path}
                      key={route.path}>
                      {route.path === "/" ? "Home" : route.page_title}
                    </Option>
                  );
                })}
              </OptionSheet>
            </Select>
          </Fieldset>
          {changesMade && (
            <Button type="submit" className={"ml-auto"} variant={"secondary"}>
              Save Changes
            </Button>
          )}
        </Form>
      </Card>
    </>
  );
}
