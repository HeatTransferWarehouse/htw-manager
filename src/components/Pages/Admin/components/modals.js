import React, { useEffect, useRef, useState } from "react";
import Scopes from "../webhooksScopes.json";
import {
  Modal,
  ModalCloseDesktop,
  ModalCloseMobile,
  ModalContent,
  ModalOverlay,
  ModalTitle,
} from "../../../Modal/modal";
import { useDrag } from "@use-gesture/react";
import {
  Fieldset,
  Form,
  Label,
  Option,
  OptionSheet,
  Select,
  Input,
  RadioGroup,
  RadioButton,
} from "../../../Form/form";
import { useDispatch } from "react-redux";
import { Button } from "../../../ui/button";

const CreateWebhook = ({ props }) => {
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const bgRef = useRef(null);
  const [destination, setDestination] = useState("");
  const [selectedScope, setSelectedScope] = useState("Select Scope");
  const [isActive, setIsActive] = useState(true);
  const [scopeDrawerOpen, setScopeDrawerOpen] = useState(false);

  const submitWebhook = async (e) => {
    e.preventDefault();
    const webhook = {
      scope: selectedScope,
      destination: `https://admin.heattransferwarehouse.com${destination}`,
      is_active: isActive,
      events_history_enabled: true,
      headers: null,
    };
    dispatch({ type: "CREATE_WEBHOOK", payload: webhook });
    props.setOpen(false);
    setDestination("");
    setSelectedScope("Select Scope");
    setIsActive(true);
  };

  const openScopeDrawer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScopeDrawerOpen(!scopeDrawerOpen);
  };

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setOpen(false);
      setDestination("");
      setSelectedScope("Select Scope");
      setIsActive(true);
    }
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) {
      cancel(props.setOpen(false));
      setDestination("");
      setSelectedScope("Select Scope");
      setIsActive(true);
    }
    if (!down && my > 50) {
      props.setOpen(false);
      setDestination("");
      setSelectedScope("Select Scope");
      setIsActive(true);
    }
  });
  return (
    <ModalOverlay
      ref={bgRef}
      handleClick={handleOutsideClick}
      open={props.open}>
      <Modal open={props.open} width={"sm"}>
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop handleClick={() => props.setOpen(false)} />
        <ModalTitle>Create Webhook</ModalTitle>
        <ModalContent>
          <Form>
            <Fieldset>
              <Label htmlFor={"scope"}>Scope</Label>
              <Select
                className={"w-fit"}
                id={"scope"}
                name={"scope select"}
                onChange={(e) => setSelectedScope(e.target.value)}
                onClick={openScopeDrawer}
                open={scopeDrawerOpen}
                setOpen={setScopeDrawerOpen}
                value={selectedScope}
                required={true}>
                <OptionSheet open={scopeDrawerOpen}>
                  <Option selectedValue={selectedScope} value={"Select Scope"}>
                    Select Scope
                  </Option>
                  {Scopes.events?.map((scope) => (
                    <Option
                      key={scope}
                      onClick={() => {
                        setSelectedScope(scope);
                        setScopeDrawerOpen(false);
                      }}
                      selectedValue={selectedScope}
                      value={scope}>
                      {scope}
                    </Option>
                  ))}
                </OptionSheet>
              </Select>
            </Fieldset>
            <Fieldset>
              <Label htmlFor={"destination"}>Destination</Label>
              <Input
                className={"max-w-96 w-full"}
                id={"destination"}
                name={"destination"}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={"ex. /api/router/route"}
                type={"text"}
                value={destination}
                required={true}
              />
            </Fieldset>
            <Fieldset>
              <Label>Active</Label>
              <RadioGroup>
                <RadioButton
                  id={"active-true"}
                  value={"Yes"}
                  checked={isActive === true}
                  name={"active true"}
                  onChange={() => setIsActive(true)}
                  required={true}
                />
                <RadioButton
                  id={"active-false"}
                  value={"No"}
                  checked={isActive === false}
                  name={"active-false"}
                  onChange={() => setIsActive(false)}
                  required={true}
                />
              </RadioGroup>
            </Fieldset>
            <div className="w-full flex justify-center items-center gap-2">
              <Button variant={"secondary"} onClick={submitWebhook}>
                Create Webhook
              </Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

const UpdateWebhook = ({ props }) => {
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const bgRef = useRef(null);
  const [destination, setDestination] = useState("");
  const [selectedScope, setSelectedScope] = useState("");
  const [isActive, setIsActive] = useState(null);
  const [eventsActive, setEventsActive] = useState(null);
  const [scopeDrawerOpen, setScopeDrawerOpen] = useState(false);

  useEffect(() => {
    setSelectedScope(props?.webhook.scope);
    setDestination(props?.webhook.destination?.split(".com")[1] ?? "");
    setIsActive(props?.webhook.isActive);
    setEventsActive(props?.webhook.eventsHistoryEnabled);
  }, [props.webhook]);

  const updateWebhook = async (e) => {
    e.preventDefault();
    const webhook = {
      scope: selectedScope,
      destination: `https://admin.heattransferwarehouse.com${destination}`,
      is_active: isActive,
      events_history_enabled: eventsActive,
      headers: null,
    };
    dispatch({
      type: "UPDATE_WEBHOOK",
      payload: { id: props?.webhook.id, webhook },
    });
    props.setOpen(false);
  };

  const openScopeDrawer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScopeDrawerOpen(!scopeDrawerOpen);
  };

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setUpdateOpen(false);
      props.setActiveWebhook({});
    }
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) {
      props.setActiveWebhook({});
      cancel(props.setOpen(false));
    }
    if (!down && my > 50) {
      props.setActiveWebhook({});
      props.setOpen(false);
    }
  });

  return (
    <ModalOverlay
      ref={bgRef}
      handleClick={handleOutsideClick}
      open={props.open}>
      <Modal open={props.open} width={"sm"}>
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop handleClick={() => props.setOpen(false)} />
        <ModalTitle>Update Webhook</ModalTitle>
        <ModalContent>
          <Form>
            <Fieldset>
              <Label htmlFor={"scope"}>Scope</Label>
              <Select
                className={"w-fit"}
                id={"scope"}
                name={"scope select"}
                onChange={(e) => setSelectedScope(e.target.value)}
                onClick={openScopeDrawer}
                open={scopeDrawerOpen}
                setOpen={setScopeDrawerOpen}
                value={selectedScope}
                required={true}>
                <OptionSheet open={scopeDrawerOpen}>
                  <Option selectedValue={selectedScope} value={"Select Scope"}>
                    Select Scope
                  </Option>
                  {Scopes.events?.map((scope) => (
                    <Option
                      key={scope}
                      onClick={() => {
                        setSelectedScope(scope);
                        setScopeDrawerOpen(false);
                      }}
                      selectedValue={selectedScope}
                      value={scope}>
                      {scope}
                    </Option>
                  ))}
                </OptionSheet>
              </Select>
            </Fieldset>
            <Fieldset>
              <Label htmlFor={"destination"}>Destination</Label>
              <Input
                className={"max-w-96 w-full"}
                id={"destination"}
                name={"destination"}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={"ex. /api/router/route"}
                type={"text"}
                value={destination}
                required={true}
              />
            </Fieldset>
            <Fieldset>
              <Label>Active</Label>
              <RadioGroup>
                <RadioButton
                  id={"active-update-true"}
                  value={"Yes"}
                  checked={isActive === true}
                  name={"active-update-true"}
                  onChange={() => setIsActive(true)}
                  required={true}
                />
                <RadioButton
                  id={"active-update-false"}
                  value={"No"}
                  checked={isActive === false}
                  name={"active-update-false"}
                  onChange={() => setIsActive(false)}
                  required={true}
                />
              </RadioGroup>
            </Fieldset>
            <Fieldset>
              <Label>Enable Events History</Label>
              <RadioGroup>
                <RadioButton
                  id={"events-true"}
                  value={"Yes"}
                  checked={eventsActive === true}
                  name={"events-true"}
                  onChange={() => setEventsActive(true)}
                  required={true}
                />
                <RadioButton
                  id={"events-false"}
                  value={"No"}
                  checked={eventsActive === false}
                  name={"events-false"}
                  onChange={() => setEventsActive(false)}
                  required={true}
                />
              </RadioGroup>
            </Fieldset>
            <div className="w-full flex justify-center items-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  props.setOpen(false);
                  props.setActiveWebhook({});
                }}
                variant={"neutral"}>
                Cancel
              </Button>
              <Button variant={"secondary"} onClick={updateWebhook}>
                Update Webhook
              </Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

export { CreateWebhook, UpdateWebhook };
