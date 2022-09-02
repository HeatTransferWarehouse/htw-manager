import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import MUITable from "../MUITable/MUITable";
import "./css/Main.css";
import './css/bootstrap.min.css';
import './css/font-awesome.css';
import './css/flex-slider.css';
import './css/templatemo-softy-pinko.css';
import { Paper, TextField } from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import DeleteIcon from "@material-ui/icons/Delete";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import QueueIcon from "@material-ui/icons/Queue";
import CloseIcon from "@material-ui/icons/Close";
import QueueNav from "./QueueNav";
import swal from "sweetalert";

class DecoQueue extends Component {
    state = {
        toggle: false,
        toggle3: false,
        toggle4: false,
        toggle5: false,
        toggle6: false,
        need_to_run: "",
        email: "",
        first_name: "",
        last_name: "",
        order_number: "",
        product_options: "",
        qty: "",
        id: "",
        sku: "",
        assigned: "",
        created_at: "",
        dataSelector: [],
    };

    componentDidMount() {
        //get all new stock items
        this.props.dispatch({
            type: "GET_QUEUE_ITEM_LIST",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST",
        });
        //get count of everything
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_APPROVE_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST_COUNT",
        });
        //delete from complete table and history table if dates meet cut off dates defined in the server
        this.props.dispatch({
            type: "DELETE_COMPLETE_RANGE",
        });
        this.props.dispatch({
            type: "DELETE_HISTORY_RANGE",
        });
    }

    handleChange = (event, fieldName) => {
        this.setState({ [fieldName]: event.target.value }); //sets to value of targeted event
    }; //end handleChange
    //toggles edit window
    toggle = () => {
        this.setState({
            toggle: !this.state.toggle,
        });
        this.props.dispatch({
            type: "GET_QUEUE_ITEM_LIST",
        });
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_APPROVE_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CUSTOM_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST_COUNT",
        });
    };
    toggle2 = () => {
        this.setState({
            toggle2: !this.state.toggle2,
        });
        this.props.dispatch({
            type: "GET_QUEUE_ITEM_LIST",
        });
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_APPROVE_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CUSTOM_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST_COUNT",
        });
    };
    toggle4 = () => {
        this.setState({
            toggle4: !this.state.toggle4,
        });
        this.props.dispatch({
            type: "GET_QUEUE_ITEM_LIST",
        });
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_APPROVE_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CUSTOM_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST_COUNT",
        });
    };
    toggle5 = () => {
        this.setState({
            toggle5: !this.state.toggle5,
        });
        this.props.dispatch({
            type: "GET_QUEUE_ITEM_LIST",
        });
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_APPROVE_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CUSTOM_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST_COUNT",
        });
    };
    toggle6 = () => {
        this.setState({
            toggle6: !this.state.toggle6,
        });
        this.props.dispatch({
            type: "GET_QUEUE_ITEM_LIST",
        });
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_APPROVE_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CUSTOM_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST_COUNT",
        });
    };

    needToRun = (event) => {
        //assigns the task to a decovibe worker
        event.preventDefault();
        const { id, need_to_run } = this.state;
        this.props.dispatch({
            type: "NEED_TO_RUN",
            payload: {
                id: id,
                need_to_run: need_to_run,
            },
        });
        this.setState({
            toggle5: false,
        });
        this.props.dispatch({
            type: "GET_QUEUE_ITEM_LIST",
        });
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_APPROVE_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CUSTOM_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_CONFIRM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_PROGRESS_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_COMPLETE_LIST_COUNT",
        });
    };

    //This function handles storing input values into state on change
    handleInputChangeFor = (propertyName) => (event) => {
        this.setState({
            [propertyName]: event.target.value,
        });
    };

    cleanDate = (date) => {
        if (date) {
            let cleanedDate = date.slice(5, 15);
            return cleanedDate;
        } else {
            return
        }
    }

    render() {
        //defines the dataselector to know which items to preform actions on
        let dataSelector = this.state.dataSelector;
        let decoSku3 = "";
        let decoSku5 = "";
        let decoSku7 = "";
        let decoSku6 = "";
        let descrip = "";


        let data = [];

        if (this.props.itemlist) {
            data = this.props.itemlist.map((item) => [
                item.order_number,
                item.sku,
                item.description,
                item.product_length,
                item.qty,
                this.cleanDate(item.created_at),
                item.need_to_run,
            ]);
        } else {
            data = [];
        }

        return (
            <div className="queue-container-return">
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <QueueNav />
                <div style={{ padding: "1.5%" }}>
                    {this.props.user.role === "csr" ? (
                        <span></span>
                    ) : (
                        <div className="multiButtons">
                            <Button
                                variant="success"
                                onClick={(event) => {
                                    if (dataSelector[0]) {
                                        this.setState({
                                            toggle6: !this.state.toggle6,
                                            toggle3: false,
                                        });
                                    } else {
                                        swal('Select some orders first!');
                                    }
                                }}
                            >
                                <QueueIcon /><p>Edit Qty</p>
                            </Button>
                            <Button
                                variant="success"
                                onClick={(event) => {
                                    if (dataSelector[0]) {
                                        event.preventDefault();
                                        for (let index = 0; index < dataSelector.length; index++) {
                                            //loop through the dataselector to know which indexes are checked, preform action on those indexes
                                            const element = dataSelector[index];
                                            this.props.dispatch({
                                                type: "START_ITEM",
                                                payload: {
                                                    id: element.id,
                                                    email: element.email,
                                                    first_name: element.first_name,
                                                    last_name: element.last_name,
                                                    order_number: element.order_number,
                                                    description: element.description,
                                                    sku: element.sku,
                                                    product_length: element.product_length,
                                                    product_options: element.product_options,
                                                    qty: element.qty,
                                                    assigned: element.assigned,
                                                    created_at: element.created_at,
                                                    priority: element.priority,
                                                },
                                            });
                                            this.props.dispatch({
                                                type: "DELETE_ITEM_QUEUE",
                                                payload: element.id,
                                            });
                                        }
                                        this.props.dispatch({
                                            type: "GET_QUEUE_ITEM_LIST",
                                        });
                                        this.props.dispatch({
                                            type: "GET_ITEM_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_RESPOND_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_APPROVE_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_CONFIRM_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_CUSTOM_ITEM_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_PROGRESS_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_COMPLETE_LIST_COUNT",
                                        });
                                        //uncheck all inputs
                                        let checkInput = document.getElementsByTagName("input");
                                        for (let index = 0; index < checkInput.length; index++) {
                                            const element = checkInput[index];
                                            element.checked = false;
                                        }
                                        //...and clear the dataselector
                                        dataSelector = [];
                                        this.setState({
                                            dataSelector: [],
                                            toggle3: false,
                                        });
                                    } else {
                                        swal('Select some orders first!');
                                    }
                                }}
                            >
                                <PlayArrowIcon /><p>Start</p>
                            </Button>
                            {/* mark the selected items complete */}
                            <Button
                                variant="success"
                                onClick={(event) => {
                                    if (dataSelector[0]) {
                                        event.preventDefault();
                                        for (let index = 0; index < dataSelector.length; index++) {
                                            const element = dataSelector[index];
                                            this.props.dispatch({
                                                type: "MARK_COMPLETE",
                                                payload: {
                                                    id: element.id,
                                                    email: element.email,
                                                    first_name: element.first_name,
                                                    last_name: element.last_name,
                                                    order_number: element.order_number,
                                                    sku: element.sku,
                                                    description: element.description,
                                                    product_length: element.product_length,
                                                    product_options: element.product_options,
                                                    qty: element.qty,
                                                    assigned: element.assigned,
                                                    created_at: element.created_at,
                                                    priority: element.priority,
                                                },
                                            });
                                            this.props.dispatch({
                                                type: "DELETE_ITEM_QUEUE",
                                                payload: element.id,
                                            });
                                        }
                                        this.props.dispatch({
                                            type: "GET_QUEUE_ITEM_LIST",
                                        });
                                        this.props.dispatch({
                                            type: "GET_ITEM_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_RESPOND_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_APPROVE_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_CONFIRM_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_CUSTOM_ITEM_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_PROGRESS_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_COMPLETE_LIST_COUNT",
                                        });
                                        let checkInput = document.getElementsByTagName("input");
                                        for (let index = 0; index < checkInput.length; index++) {
                                            const element = checkInput[index];
                                            element.checked = false;
                                        }
                                        dataSelector = [];
                                        this.setState({
                                            dataSelector: [],
                                            toggle3: false,
                                        });
                                    } else {
                                        swal('Select some orders first!');
                                    }
                                }}
                            >
                                <AssignmentTurnedInIcon /><p>Complete</p>
                            </Button>
                            {/* deleted selected items */}
                            <Button
                                variant="danger"
                                onClick={(event) => {
                                    if (dataSelector[0]) {
                                        event.preventDefault();
                                        //sweet alerts to warn of irreversible action
                                        swal({
                                            title: "Are you sure?",
                                            text:
                                                "Once deleted, you will not be able to recover the sku on these orders!",
                                            icon: "warning",
                                            buttons: true,
                                            dangerMode: true,
                                        }).then((willDelete) => {
                                            if (willDelete) {
                                                for (
                                                    let index = 0;
                                                    index < dataSelector.length;
                                                    index++
                                                ) {
                                                    const element = dataSelector[index];
                                                    this.props.dispatch({
                                                        type: "DELETE_ITEM_QUEUE",
                                                        payload: element.id,
                                                    });
                                                }
                                                this.props.dispatch({
                                                    type: "GET_QUEUE_ITEM_LIST",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_ITEM_LIST_COUNT",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_RESPOND_LIST_COUNT",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_APPROVE_LIST_COUNT",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_CONFIRM_LIST_COUNT",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_CUSTOM_ITEM_LIST_COUNT",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_PROGRESS_LIST_COUNT",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_COMPLETE_LIST_COUNT",
                                                });
                                                let checkInput = document.getElementsByTagName("input");
                                                for (let index = 0; index < checkInput.length; index++) {
                                                    const element = checkInput[index];
                                                    console.log(element.checked);
                                                    element.checked = false;
                                                }
                                                dataSelector = [];
                                                this.setState({
                                                    dataSelector: [],
                                                    toggle3: false,
                                                });
                                            } else {
                                            }
                                        });
                                    } else {
                                        swal('Select some orders first!');
                                    }
                                }}
                            >
                                <DeleteIcon /><p>Delete</p>
                            </Button>
                        </div>
                    )}
                    <br />
                    <br />
                    <br />
                    <MUITable
                        data={data} //brings in data as an array, in this case, list of items
                        columns={[
                            //names the columns found on MUI table
                            //col with the checkboxes
                            {
                                name: "",
                                options: {
                                    filter: false,
                                    sort: false,
                                    empty: true,
                                    confirmFilters: true,
                                    customBodyRenderLite: (dataIndex, rowIndex) => {
                                        return this.props.user.role === "csr" ? (
                                            <span></span>
                                        ) : (
                                            <input
                                                type="checkbox"
                                                id={dataIndex}
                                                style={{ cursor: "pointer", width: 50, height: 50 }}
                                                name=""
                                                value=""
                                                onClick={(event) => {
                                                    //if clicked, check the checkbox
                                                    let checkChecked = document.getElementById(dataIndex)
                                                        .checked;
                                                    const itemArray = this.props.itemlist;
                                                    const item = itemArray[dataIndex];
                                                    if (checkChecked === true) {
                                                        //...and push the index into the dataselector
                                                        dataSelector.push(item);
                                                    } else {
                                                        //when deselected, remove the index from the dataselector
                                                        for (
                                                            let index = 0;
                                                            index < dataSelector.length;
                                                            index++
                                                        ) {
                                                            const element = dataSelector[index];
                                                            if (item.id === element.id) {
                                                                dataSelector.splice(index, 1);
                                                            }
                                                        }
                                                    }
                                                    console.log(dataSelector);
                                                }}
                                            ></input>
                                        );
                                    },
                                },
                            },
                            { name: "Order Number" },
                            {
                                name: "SKU",
                                options: {
                                    filter: true,
                                    sort: true,
                                    // empty: true,
                                    customBodyRender: (value, dataIndex) => {
                                        decoSku3 = value.slice(0, 6);
                                        decoSku5 = value.slice(0, 3);
                                        decoSku7 = value.slice(0, 7);
                                        decoSku6 = value.slice(0, 8);
                                        let descrip = dataIndex.rowData[3];
                                        if (
                                            decoSku5 === "SD1" ||
                                            decoSku5 === "SD2" ||
                                            decoSku5 === "SD3" ||
                                            decoSku5 === "SD4" ||
                                            decoSku5 === "SD5" ||
                                            decoSku5 === "SD6" ||
                                            decoSku5 === "SD7" ||
                                            decoSku5 === "SD8" ||
                                            decoSku5 === "SD9" ||
                                            decoSku6 === "SETUPFEE" ||
                                            descrip.includes("Bundle")
                                        ) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "#F7B665",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else if (
                                            decoSku5 === "CS1" ||
                                            decoSku5 === "CS2" ||
                                            decoSku5 === "CS3" ||
                                            decoSku5 === "CS4" ||
                                            decoSku5 === "CS5" ||
                                            decoSku5 === "CS6" ||
                                            decoSku5 === "CS7" ||
                                            decoSku5 === "CS8" ||
                                            decoSku5 === "CS9" ||
                                            decoSku6 === "CUSTOM-S"
                                        ) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "#90CA6D",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else if (
                                            decoSku7 === "SISER-1" ||
                                            decoSku7 === "SISER-2" ||
                                            decoSku7 === "SISER-3" ||
                                            decoSku7 === "SISER-4" ||
                                            decoSku7 === "SISER-5" ||
                                            decoSku7 === "SISER-6" ||
                                            decoSku7 === "SISER-7" ||
                                            decoSku7 === "SISER-8" ||
                                            decoSku7 === "SISER-9"
                                        ) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "#F8F18A",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else if (
                                            decoSku5 === "CD1" ||
                                            decoSku5 === "CD2" ||
                                            decoSku5 === "CD3" ||
                                            decoSku5 === "CD4" ||
                                            decoSku5 === "CD5" ||
                                            decoSku5 === "CD6" ||
                                            decoSku5 === "CD7" ||
                                            decoSku5 === "CD8" ||
                                            decoSku5 === "CD9" ||
                                            decoSku6 === "CUSTOM-H"
                                        ) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "#EEB7D2",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else if (
                                            decoSku5 === "SDC"
                                        ) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "#F48267",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else if (
                                            decoSku3 === "SUBPAT"
                                        ) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "#7AD7F0",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else {
                                            return <div>{value}</div>;
                                        }
                                    },
                                },
                            },
                            {
                                name: "Description",
                                options: {
                                    filter: true,
                                    sort: true,
                                    // empty: true,
                                    customBodyRender: (value, tableMeta, updateValue) => {
                                        if (value) {
                                            descrip = value.slice(value.length - 4);
                                        }
                                        if (descrip === "Pack" || descrip === "pack" || descrip === "PACK") {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "#5D82C1",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else if (value.includes("Bundle")) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "rgb(131 206 206)",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        } else if (value) {
                                            return <div>{value}</div>;
                                        } else {
                                            return <div>No Desc</div>;
                                        }
                                    },
                                },
                            },
                            { name: "Length" },
                            {
                                name: "QTY",
                                options: {
                                    customBodyRender: (value, dataIndex) => {
                                        let descrip = dataIndex.rowData[3];
                                        if (descrip.includes("Pack")) {
                                            let packIndex = descrip.indexOf("Pack");
                                            let packQuantity = packIndex - 2;
                                            return descrip[packQuantity] * value;
                                        } else if (descrip.includes("PACK")) {
                                            let packIndex = descrip.indexOf("PACK");
                                            let packQuantity = packIndex - 2;
                                            return descrip[packQuantity] * value;
                                        } else {
                                            return value
                                        }
                                    }
                                }
                            },
                            { name: "Created At" },
                            {
                                name: "Number to Run",
                                options: {
                                    filter: true,
                                    sort: true,
                                    customBodyRender: (value, tableMeta, updateValue) => {
                                        if (value) {
                                            return (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: "rgb(190, 147, 212)",
                                                        color: "black",
                                                        textAlign: "center",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        }
                                    },

                                },
                            },
                            {
                                name: "Start",
                                options: {
                                    filter: false,
                                    sort: false,
                                    // empty: false,
                                    customBodyRenderLite: (dataIndex, rowIndex) => {
                                        return this.props.user.role === "csr" ? (
                                            <span></span>
                                        ) : (
                                            <Button
                                                variant="success"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    const itemArray = this.props.itemlist;
                                                    const item = itemArray[dataIndex];
                                                    this.props.dispatch({
                                                        type: "START_ITEM",
                                                        payload: {
                                                            id: item.id,
                                                            email: item.email,
                                                            first_name: item.first_name,
                                                            last_name: item.last_name,
                                                            order_number: item.order_number,
                                                            sku: item.sku,
                                                            description: item.description,
                                                            product_length: item.product_length,
                                                            product_options: item.product_options,
                                                            qty: item.qty,
                                                            assigned: item.assigned,
                                                            created_at: item.created_at,
                                                            priority: item.priority,
                                                        },
                                                    });
                                                    this.props.dispatch({
                                                        type: "DELETE_ITEM_QUEUE",
                                                        payload: item.id,
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_QUEUE_ITEM_LIST",
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_ITEM_LIST_COUNT",
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_RESPOND_LIST_COUNT",
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_APPROVE_LIST_COUNT",
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_CUSTOM_ITEM_LIST_COUNT",
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_CONFIRM_LIST_COUNT",
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_PROGRESS_LIST_COUNT",
                                                    });
                                                    this.props.dispatch({
                                                        type: "GET_COMPLETE_LIST_COUNT",
                                                    });
                                                }}
                                            >
                                                <PlayArrowIcon></PlayArrowIcon>
                                            </Button>
                                        );
                                    },
                                },
                            },
                        ]}
                        title={"New Items"} //give the table a name
                    />
                    {this.state.toggle === false ? (
                        //if toggle is false, render nothing. This is the default
                        <span></span>
                    ) : (
                        //else render the assign window
                        <Paper
                            style={{
                                right: 0,
                                bottom: 0,
                                position: "fixed",
                                borderRadius: "10%",
                                height: "600px",
                                width: "400px",
                                zIndex: "1000000000",
                                border: "50px",
                                overflow: "scroll",
                                fontSize: "15px",
                                backgroundColor: "white",
                            }}
                            elevation="24"
                            className="loginBox"
                        >
                            <td
                                style={{
                                    backgroundColor: "white",
                                    padding: "5%",
                                }}
                            >
                                <br />
                                <br />{" "}
                                {/* toggles edit window back to not displaying */}
                                <br />
                                <br />
                                <br />
                                <br />
                                <br />
                                <Button onClick={this.toggle} variant="success" type="submit">
                                    Go Back
                                </Button>
                            </td>
                        </Paper>
                    )}

                    {this.state.toggle4 === false ? (
                        //if toggle is false, render nothing. This is the default
                        <span></span>
                    ) : (
                        //another assign window for the selected checkboxes. Needed it's own window because the functionality needed to be altered a bit for this feature
                        <Paper
                            style={{
                                right: 0,
                                bottom: 0,
                                position: "fixed",
                                borderRadius: "10%",
                                height: "600px",
                                width: "400px",
                                zIndex: "1000000000",
                                border: "50px",
                                overflow: "scroll",
                                fontSize: "15px",
                                backgroundColor: "white",
                            }}
                            elevation="24"
                            className="loginBox"
                        >
                            <td
                                style={{
                                    backgroundColor: "white",
                                    padding: "5%",
                                }}
                            >
                                <br />
                                <br />{" "}
                                {/* toggles edit window back to not displaying */}
                                <br />
                                <br />
                                <br />
                                <br />
                                <br />
                                <Button onClick={this.toggle4} variant="success" type="submit">
                                    Go Back
                                </Button>
                            </td>
                        </Paper>
                    )}

                    {this.state.toggle5 === false ? (
                        //if toggle is false, render nothing. This is the default
                        <span></span>
                    ) : (
                        //else render the assign window
                        <Paper
                            style={{
                                right: 0,
                                bottom: 0,
                                position: "fixed",
                                borderRadius: "10%",
                                padding: "1em",
                                height: "300px",
                                width: "400px",
                                zIndex: "1000000000",
                                border: "50px",
                                overflow: "scroll",
                                fontSize: "15px",
                                backgroundColor: "white",
                            }}
                            elevation="24"
                            className="loginBox"
                        >
                            <td
                                style={{
                                    backgroundColor: "white",
                                    padding: "5%",
                                }}
                            >
                                <br />
                                <br />{" "}
                                <form onSubmit={this.needToRun}>
                                    <TextField
                                        style={{
                                            width: "150%",
                                        }}
                                        variant="outlined"
                                        label="Enter amount to run"
                                        name="edit"
                                        placeholder="Enter amount to run"
                                        // value of local state as text value
                                        value={this.state.need_to_run}
                                        type="text"
                                        maxLength={10}
                                        //runs handleChange on input change
                                        onChange={(event) =>
                                            this.handleChange(event, "need_to_run")
                                        }
                                    />
                                    <br />
                                    <br />
                                    <br />
                                    <br />
                                    {/* onClick tied to form element, runs submitInfo on click */}
                                    <Button variant="success" type="submit">
                                        Set Amount
                                    </Button>
                                </form>
                                {/* toggles edit window back to not displaying */}
                                <br />
                                <br />
                                <br />
                                <br />
                                <br />
                                <Button onClick={this.toggle5} variant="success" type="submit">
                                    Go Back
                                </Button>
                            </td>
                        </Paper>
                    )}
                    {this.state.toggle6 === false ? (
                        //if toggle is false, render nothing. This is the default
                        <span></span>
                    ) : (
                        //another assign window for the selected checkboxes. Needed it's own window because the functionality needed to be altered a bit for this feature
                        <Paper
                            style={{
                                right: 0,
                                bottom: 0,
                                position: "fixed",
                                borderRadius: "10%",
                                height: "250px",
                                width: "400px",
                                zIndex: "1000000000",
                                border: "50px",
                                overflow: "hidden",
                                padding: "1em",
                                fontSize: "15px",
                                backgroundColor: "white",
                            }}
                            elevation="24"
                            className="editQuantity"
                        >
                            <td
                                style={{
                                    backgroundColor: "white",
                                    padding: "5%",
                                }}
                            >
                                <br />
                                <br />{" "}
                                <h2 className="editQuantityHeader">Edit Quantity</h2>
                                <hr />
                                <form
                                    onSubmit={(event) => {
                                        //prevents default action
                                        event.preventDefault();
                                        const { need_to_run } = this.state;
                                        for (let index = 0; index < dataSelector.length; index++) {
                                            const element = dataSelector[index];
                                            this.props.dispatch({
                                                type: "NEED_TO_RUN",
                                                payload: {
                                                    id: element.id,
                                                    need_to_run: need_to_run,
                                                },
                                            });
                                            this.setState({
                                                toggle6: false,
                                            });
                                            this.props.dispatch({
                                                type: "GET_QUEUE_ITEM_LIST",
                                            });
                                            this.props.dispatch({
                                                type: "GET_ITEM_LIST_COUNT",
                                            });
                                            this.props.dispatch({
                                                type: "GET_RESPOND_LIST_COUNT",
                                            });
                                            this.props.dispatch({
                                                type: "GET_APPROVE_LIST_COUNT",
                                            });
                                            this.props.dispatch({
                                                type: "GET_CUSTOM_ITEM_LIST_COUNT",
                                            });
                                            this.props.dispatch({
                                                type: "GET_CONFIRM_LIST_COUNT",
                                            });
                                            this.props.dispatch({
                                                type: "GET_PROGRESS_LIST_COUNT",
                                            });
                                            this.props.dispatch({
                                                type: "GET_COMPLETE_LIST_COUNT",
                                            });
                                        }
                                        let checkInput = document.getElementsByTagName("input");
                                        for (let index = 0; index < checkInput.length; index++) {
                                            const element = checkInput[index];
                                            console.log(element.checked);
                                            element.checked = false;
                                        }
                                        dataSelector = [];
                                        this.setState({
                                            dataSelector: [],
                                        });
                                    }}
                                >
                                    <TextField
                                        style={{
                                            width: "150%",
                                            marginRight: "1em"
                                        }}
                                        variant="outlined"
                                        label="Enter amount to run"
                                        name="edit"
                                        placeholder="Enter amount to run"
                                        // value of local state as text value
                                        value={this.state.need_to_run}
                                        type="text"
                                        maxLength={10}
                                        //runs handleChange on input change
                                        onChange={(event) =>
                                            this.handleChange(event, "need_to_run")
                                        }
                                    />
                                    <br />
                                    <br />
                                    <br />
                                    <br />
                                    {/* onClick tied to form element, runs submitInfo on click */}
                                    <Button variant="success" type="submit" className="setAmount">
                                        Confirm
                                    </Button>
                                </form>
                                {/* toggles edit window back to not displaying */}
                                <br />
                                <br />
                                <br />
                                <br />
                                <br />
                                <Button onClick={this.toggle6} variant="secondary" type="submit" className="goBack">
                                    <CloseIcon />
                                </Button>
                            </td>
                        </Paper>
                    )}
                </div>
                <br />
                <br />
                <br />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
    itemlist: state.queue.itemlist,
});
export default connect(mapStateToProps)(DecoQueue);
