import React, { Component } from "react";
import { connect } from "react-redux";
import MUIDataTable from "mui-datatables";

class MUITable extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: "GET_USERS",
    });
  }

  state = {
    //title: this.props.title,
    setResponsive: "vertical",
    setTableBodyHeight: "400px",
    setTableBodyMaxHeight: " ",
    options: {
      filter: false,
      rowHover: false,
      print: false,
      download: false,
      filterType: "dropdown",
      responsive: "vertical",
      tableBodyHeight: "550px",
      tableBodyMaxHeight: " ",
      rowsPerPage: 100,
      rowsPerPageOptions: [10, 50, 100],
      searchPlaceholder: "Search",
      viewColumns: false,
      searchAlwaysOpen: true,
      draggableColumns: { enabled: true },
      selectableRows: "none", //false means checkboxes are hidden, I created my own checkbox functionality so this is turned off
    },
  };

  render() {
    return (
      <React.Fragment>
        <MUIDataTable
          title=""
          data={this.props.data}
          columns={this.props.columns}
          options={this.state.options}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(MUITable);
