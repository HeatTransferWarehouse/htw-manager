import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import MUITable from "../MUITable/MUITable";
import swal from "sweetalert";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import DeleteIcon from "@material-ui/icons/Delete";
import RestoreIcon from "@material-ui/icons/Restore";
import QueueNav from "./QueueNav";
import FlagIcon from "@material-ui/icons/Flag";


class Progress extends Component {
    state = {
        toggle3: false,
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
        this.props.dispatch({
            type: "GET_PROGRESS_LIST",
        });
        this.props.dispatch({
            type: "GET_ITEM_LIST_COUNT",
        });
        this.props.dispatch({
            type: "GET_RESPOND_LIST_COUNT",
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
        this.props.dispatch({
            type: "DELETE_COMPLETE_RANGE",
        });
        this.props.dispatch({
            type: "DELETE_HISTORY_RANGE",
        });
        console.log("PROGRESS LIST Reducer", this.props.progresslist)
    }

    cleanDate = (date) => {
        if (date) {
            let cleanedDate = date.slice(5, 15);
            return cleanedDate;
        } else {
            return
        }
    }

    render() {
        let dataSelector = this.state.dataSelector;
        let decoSku3 = "";
        let decoSku5 = "";
        let decoSku7 = "";
        let decoSku6 = "";
        let descrip = "";

        let data = [];
        if (this.props.progresslist) {
            data = this.props.progresslist.map((progress) => [
                progress.order_number,
                progress.sku,
                progress.description,
                progress.product_length,
                progress.qty,
                this.cleanDate(progress.created_at)
            ]);
        } else {
            data = [];
        }

        return (
            <div>
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
                                                type: "DELETE_PROGRESS",
                                                payload: element.id,
                                            });
                                        }
                                        this.props.dispatch({
                                            type: "GET_PROGRESS_LIST",
                                        });
                                        this.props.dispatch({
                                            type: "GET_ITEM_LIST_COUNT",
                                        });
                                        this.props.dispatch({
                                            type: "GET_RESPOND_LIST_COUNT",
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
                            <Button
                                variant="success"
                                onClick={(event) => {
                                    if (dataSelector[0]) {
                                        event.preventDefault();
                                        for (let index = 0; index < dataSelector.length; index++) {
                                            const element = dataSelector[index];
                                            this.props.dispatch({
                                                type: "ADD_NEW",
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
                                                type: "DELETE_PROGRESS",
                                                payload: element.id,
                                            });
                                        }
                                        this.props.dispatch({
                                            type: "GET_PROGRESS_LIST",
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
                                        this.setState({
                                            dataSelector: [],
                                        });
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
                                <RestoreIcon /><p>Send Back</p>
                            </Button>
                            <Button
                                variant="danger"
                                onClick={(event) => {
                                    if (dataSelector[0]) {
                                        event.preventDefault();
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
                                                        type: "DELETE_PROGRESS",
                                                        payload: element.id,
                                                    });
                                                }
                                                this.props.dispatch({
                                                    type: "GET_PROGRESS_LIST",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_ITEM_LIST_COUNT",
                                                });
                                                this.props.dispatch({
                                                    type: "GET_RESPOND_LIST_COUNT",
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
                                                console.log("delete canceled");
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
                        data={data}
                        columns={[
                            //names the columns found on MUI table
                            {
                                name: "",
                                options: {
                                    filter: false,
                                    sort: false,
                                    empty: true,
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
                                                    let checkChecked = document.getElementById(dataIndex)
                                                        .checked;
                                                    const itemArray = this.props.progresslist;
                                                    const item = itemArray[dataIndex];
                                                    if (checkChecked === true) {
                                                        dataSelector.push(item);
                                                    } else {
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
                                                    console.log(dataSelector)
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
                                        } else if (decoSku3 === "SUBPAT") {
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
                                        descrip = value.slice(value.length - 4);
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
                                        } else {
                                            return <div>{value}</div>;
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
                                            ;
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
                            // { name: "Assigned" },
                            { name: "Created At" },
                        ]}
                        title={"Items In Progress"} //give the table a name
                    />
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
    progresslist: state.queue.progresslist,
});
export default connect(mapStateToProps)(Progress);
