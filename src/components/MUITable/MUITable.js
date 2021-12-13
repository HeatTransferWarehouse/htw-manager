import React, {Component} from "react";
import { connect } from "react-redux";
import MUIDataTable from "mui-datatables";


class MUITable extends Component {

  state = {
    //title: this.props.title,
    setResponsive: "vertical",
    setTableBodyHeight: "400px",
    setTableBodyMaxHeight: " ",
    options: {
      filter: true,
      filterType: "dropdown",
      responsive: "vertical",
      tableBodyHeight: "600px",
      tableBodyMaxHeight: " ",
      rowsPerPage: 2000,
      rowsPerPageOptions: [2000],
      selectableRows: false, //false means checkboxes are hidden, I created my own checkbox functionality so this is turned off
    },
  };

  render() {
    return (
      <React.Fragment>
        <MUIDataTable
          title={this.props.title}
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