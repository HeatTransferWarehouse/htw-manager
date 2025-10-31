import React, { useEffect, useRef, useState } from 'react';
import Scopes from '../webhooksScopes.json';
import {
  Modal,
  ModalCloseDesktop,
  ModalCloseMobile,
  ModalContent,
  ModalOverlay,
  ModalTitle,
} from '../../../Modal/modal';
import { useDrag } from '@use-gesture/react';
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
} from '../../../Form/form';
import { useDispatch } from 'react-redux';
import { Button } from '../../../ui/button';

const CreateWebhook = ({ props }) => {
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const bgRef = useRef(null);
  const [destination, setDestination] = useState('');
  const [selectedScope, setSelectedScope] = useState('Select Scope');
  const [selectedStore, setSelectedStore] = useState('Select Store');
  const [isActive, setIsActive] = useState(true);
  const [scopeDrawerOpen, setScopeDrawerOpen] = useState(false);
  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);

  const storeMap = {
    htw: 'Heat Transfer Warehouse',
    sff: 'Shirts From Fargo',
    sb: 'HTW Sandbox',
  };

  const submitWebhook = async (e) => {
    e.preventDefault();
    const webhook = {
      scope: selectedScope,
      destination: `https://admin.heattransferwarehouse.com${destination}`,
      is_active: isActive,
      events_history_enabled: true,
      headers: null,
    };
    dispatch({ type: 'CREATE_WEBHOOK', payload: webhook });
    props.setOpen(false);
    setDestination('');
    setSelectedScope('Select Scope');
    setSelectedStore('Select Store');
    setIsActive(true);
  };

  const openScopeDrawer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScopeDrawerOpen(!scopeDrawerOpen);
  };

  const openStoreDrawer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStoreDrawerOpen(!storeDrawerOpen);
  };

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setOpen(false);
      setDestination('');
      setSelectedScope('Select Scope');
      setSelectedStore('Select Store');
      setIsActive(true);
    }
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) {
      cancel(props.setOpen(false));
      setDestination('');
      setSelectedScope('Select Scope');
      setSelectedStore('Select Store');
      setIsActive(true);
    }
    if (!down && my > 50) {
      props.setOpen(false);
      setDestination('');
      setSelectedScope('Select Scope');
      setSelectedStore('Select Store');
      setIsActive(true);
    }
  });
  return (
    <ModalOverlay ref={bgRef} handleClick={handleOutsideClick} open={props.open}>
      <Modal open={props.open} width="sm">
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop handleClick={() => props.setOpen(false)} />
        <ModalTitle>Create Webhook</ModalTitle>
        <ModalContent>
          <Form>
            <Fieldset>
              <Label htmlFor="scope">Scope</Label>
              <Select
                className="w-fit"
                id="scope"
                name="scope select"
                onChange={(e) => setSelectedScope(e.target.value)}
                onClick={openScopeDrawer}
                open={scopeDrawerOpen}
                setOpen={setScopeDrawerOpen}
                value={selectedScope}
                required={true}
              >
                <OptionSheet open={scopeDrawerOpen}>
                  <Option selectedValue={selectedScope} value="Select Scope">
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
                      value={scope}
                    >
                      {scope}
                    </Option>
                  ))}
                </OptionSheet>
              </Select>
            </Fieldset>
            <Fieldset>
              <Label htmlFor="destination">Destination</Label>
              <Input
                className="max-w-96 w-full"
                id="destination"
                name="destination"
                onChange={(e) => setDestination(e.target.value)}
                placeholder="ex. /api/router/route"
                type="text"
                value={destination}
                required={true}
              />
            </Fieldset>
            <Fieldset>
              <Label htmlFor="scope">Storefront</Label>
              <Select
                className="w-60"
                id="storefront"
                name="storefront select"
                onChange={(e) => setSelectedStore(e.target.value)}
                onClick={openStoreDrawer}
                open={storeDrawerOpen}
                setOpen={setStoreDrawerOpen}
                value={selectedStore}
                required={true}
              >
                <OptionSheet open={storeDrawerOpen}>
                  <Option selectedValue={selectedStore} value="Select Store">
                    Select Store
                  </Option>

                  <Option
                    onClick={() => {
                      setSelectedStore('htw');
                      setStoreDrawerOpen(false);
                    }}
                    selectedValue={selectedStore}
                    value={storeMap['htw']}
                  >
                    {storeMap['htw']}
                  </Option>
                  <Option
                    onClick={() => {
                      setSelectedStore('sff');
                      setStoreDrawerOpen(false);
                    }}
                    selectedValue={selectedStore}
                    value={storeMap['sff']}
                  >
                    {storeMap['sff']}
                  </Option>
                  <Option
                    onClick={() => {
                      setSelectedStore('sb');
                      setStoreDrawerOpen(false);
                    }}
                    selectedValue={selectedStore}
                    value={storeMap['sb']}
                  >
                    {storeMap['sb']}
                  </Option>
                </OptionSheet>
              </Select>
            </Fieldset>
            <Fieldset>
              <Label>Active</Label>
              <RadioGroup>
                <RadioButton
                  id="active-true"
                  value="Yes"
                  checked={isActive === true}
                  name="active true"
                  onChange={() => setIsActive(true)}
                  required={true}
                />
                <RadioButton
                  id="active-false"
                  value="No"
                  checked={isActive === false}
                  name="active-false"
                  onChange={() => setIsActive(false)}
                  required={true}
                />
              </RadioGroup>
            </Fieldset>
            <div className="w-full flex justify-center items-center gap-2">
              <Button variant="secondary" onClick={submitWebhook}>
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
  const [destination, setDestination] = useState('');
  const [selectedScope, setSelectedScope] = useState('');
  const [isActive, setIsActive] = useState(null);
  const [eventsActive, setEventsActive] = useState(null);
  const [scopeDrawerOpen, setScopeDrawerOpen] = useState(false);

  useEffect(() => {
    setSelectedScope(props?.webhook.scope);
    setDestination(props?.webhook.destination?.split('.com')[1] ?? '');
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
      type: 'UPDATE_WEBHOOK',
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
    <ModalOverlay ref={bgRef} handleClick={handleOutsideClick} open={props.open}>
      <Modal open={props.open} width="sm">
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop handleClick={() => props.setOpen(false)} />
        <ModalTitle>Update Webhook</ModalTitle>
        <ModalContent>
          <Form>
            <Fieldset>
              <Label htmlFor="update-scope">Scope</Label>
              <Select
                className="w-fit"
                id="update-scope"
                name="update-scope"
                onChange={(e) => setSelectedScope(e.target.value)}
                onClick={openScopeDrawer}
                open={scopeDrawerOpen}
                setOpen={setScopeDrawerOpen}
                value={selectedScope}
                required={true}
              >
                <OptionSheet open={scopeDrawerOpen}>
                  <Option selectedValue={selectedScope} value="Select Scope">
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
                      value={scope}
                    >
                      {scope}
                    </Option>
                  ))}
                </OptionSheet>
              </Select>
            </Fieldset>
            <Fieldset>
              <Label htmlFor="update-destination">Destination</Label>
              <Input
                className="max-w-96 w-full"
                id="update-destination"
                name="update-destination"
                onChange={(e) => setDestination(e.target.value)}
                placeholder="ex. /api/router/route"
                type="text"
                value={destination}
                required={true}
              />
            </Fieldset>
            <Fieldset>
              <Label>Active</Label>
              <RadioGroup>
                <RadioButton
                  id="active-update-true"
                  value="Yes"
                  checked={isActive === true}
                  name="active-update-true"
                  onChange={() => setIsActive(true)}
                  required={true}
                />
                <RadioButton
                  id="active-update-false"
                  value="No"
                  checked={isActive === false}
                  name="active-update-false"
                  onChange={() => setIsActive(false)}
                  required={true}
                />
              </RadioGroup>
            </Fieldset>
            <Fieldset>
              <Label>Enable Events History</Label>
              <RadioGroup>
                <RadioButton
                  id="events-true"
                  value="Yes"
                  checked={eventsActive === true}
                  name="events-true"
                  onChange={() => setEventsActive(true)}
                  required={true}
                />
                <RadioButton
                  id="events-false"
                  value="No"
                  checked={eventsActive === false}
                  name="events-false"
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
                variant="neutral"
              >
                Cancel
              </Button>
              <Button variant="secondary" onClick={updateWebhook}>
                Update Webhook
              </Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

const UpdateUser = ({ props }) => {
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const bgRef = useRef(null);
  const [selectDrawerOpen, setSelectDrawerOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setUsername(props?.user.email);
    setRole(props?.user.access_level === 5 ? 'Admin' : 'Member');
    setPassword(props?.user.password);
    setUserId(props?.user.id);
    setUserId(props?.user.id);
  }, [props.user]);

  const updateUser = async (e) => {
    e.preventDefault();

    dispatch({
      type: 'UPDATE_USER',
      payload: {
        id: userId,
        username: username,
        password: password,
        role: role,
      },
    });
    setUsername('');
    setPassword('');
    setRole(null);
    setUserId(null);
    props.setOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setOpen(false);
    }
  };

  const openSelectDrawer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectDrawerOpen(!selectDrawerOpen);
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) {
      cancel(props.setOpen(false));
    }
    if (!down && my > 50) {
      props.setOpen(false);
    }
  });

  return (
    <ModalOverlay ref={bgRef} handleClick={handleOutsideClick} open={props.open}>
      <Modal open={props.open} width="sm">
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop handleClick={() => props.setOpen(false)} />
        <ModalTitle>Edit User</ModalTitle>
        <ModalContent>
          <Form>
            <Fieldset>
              <Label htmlFor="role">Role</Label>
              <Select
                className="w-32"
                id="role"
                name="role"
                onChange={(e) => setRole(e.target.value)}
                onClick={openSelectDrawer}
                open={selectDrawerOpen}
                setOpen={setSelectDrawerOpen}
                value={role === 5 ? 'Admin' : 'Member'}
                required={true}
              >
                <OptionSheet width="8rem" open={selectDrawerOpen}>
                  <Option selectedValue={role} value="Select Role">
                    Select Role
                  </Option>
                  <Option
                    onClick={() => {
                      setRole(5);
                      setSelectDrawerOpen(false);
                    }}
                    selectedValue={role}
                    value={5}
                  >
                    Admin
                  </Option>
                  <Option
                    onClick={() => {
                      setRole(0);
                      setSelectDrawerOpen(false);
                    }}
                    selectedValue={role}
                    value={0}
                  >
                    Member
                  </Option>
                </OptionSheet>
              </Select>
            </Fieldset>
            <Fieldset>
              <Label htmlFor="edit-username">Email/Username</Label>
              <Input
                className="max-w-96 w-full"
                id="edit-username"
                name="edit-username"
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                value={username}
                required={true}
              />
            </Fieldset>
            <Fieldset>
              <Label htmlFor="edit-password">Password</Label>
              <Input
                className="max-w-96 w-full"
                id="edit-password"
                name="edit-password"
                placeholder="Enter new password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                value={password}
                required={true}
              />
            </Fieldset>

            <div className="w-full flex justify-center items-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  props.setOpen(false);
                }}
                variant="neutral"
              >
                Cancel
              </Button>
              <Button variant="secondary" onClick={updateUser}>
                Update User
              </Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

const RegisterUser = ({ props }) => {
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const bgRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const registerUser = async (e) => {
    e.preventDefault();

    dispatch({
      type: 'REGISTER',
      payload: {
        username: username,
        password: password,
      },
    });
    setUsername('');
    setPassword('');
    props.setOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setOpen(false);
    }
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) {
      cancel(props.setOpen(false));
    }
    if (!down && my > 50) {
      props.setOpen(false);
    }
  });

  return (
    <ModalOverlay ref={bgRef} handleClick={handleOutsideClick} open={props.open}>
      <Modal open={props.open} width="sm">
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop handleClick={() => props.setOpen(false)} />
        <ModalTitle>Register User</ModalTitle>
        <ModalContent>
          <Form className="items-center">
            <Fieldset className="w-fit">
              <Label htmlFor="register-username">Email/Username</Label>
              <Input
                className="max-w-96 min-w-96 w-full"
                id="register-username"
                name="register-username"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username/email"
                type="text"
                value={username}
                required={true}
              />
            </Fieldset>
            <Fieldset className="w-fit">
              <Label htmlFor="register-password">Password</Label>
              <Input
                className="max-w-96 min-w-96 w-full"
                id="register-password"
                name="register-password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                value={password}
                required={true}
              />
            </Fieldset>

            <div className="w-full flex mt-4 justify-center items-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  props.setOpen(false);
                }}
                variant="neutral"
              >
                Cancel
              </Button>
              <Button variant="secondary" onClick={registerUser}>
                Register User
              </Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

export { CreateWebhook, UpdateWebhook, UpdateUser, RegisterUser };
