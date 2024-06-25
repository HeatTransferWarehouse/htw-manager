import React, { useEffect, useRef, useState } from "react";
import Scopes from "../webhooksScopes.json";
import {
  Modal,
  ModalCloseDesktop,
  ModalCloseMobile,
  ModalContent,
  ModalOverlay,
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
  SubmitButton,
} from "../../../Form/form";
import { useDispatch } from "react-redux";

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
  };

  const openScopeDrawer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScopeDrawerOpen(!scopeDrawerOpen);
  };

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setOpen(false);
    }
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) cancel(props.setOpen(false));
    if (!down && my > 50) props.setOpen(false);
  });
  return (
    <ModalOverlay
      ref={bgRef}
      handleClick={handleOutsideClick}
      open={props.open}>
      <Modal className={"!max-w-screen-sm"} open={props.open}>
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop handleClick={() => props.setOpen(false)} />
        <h2 className="text-2xl text-center mt-4 font-bold">
          Create New Webhook
        </h2>
        <ModalContent className={"!min-h-96"}>
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
                  id={"active true"}
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
            <SubmitButton onClick={submitWebhook}>Create Webhook</SubmitButton>
          </Form>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

export { CreateWebhook };
