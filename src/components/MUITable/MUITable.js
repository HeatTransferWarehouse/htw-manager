import React from "react";
import { useDispatch } from "react-redux";
import MUIDataTable from "mui-datatables";

function MUITable () {

  const dispatch = useDispatch();

  const state = {
    options: {
      tableBodyHeight: "600px",
      filter: true,
      responsive: "vertical",
      selectableRows: "multiple",
      onRowSelectionChange: function (currentRowsSelected, allRowsSelected, rowsSelected) {
        dispatch({
          type: "ADD_ROWS",
          payload: allRowsSelected,
        });
      }
    }
  };

    return (
      <React.Fragment>
        <MUIDataTable
          title={"Sales Data"}
          data={this.props.data}
          columns={this.props.columns}
          options={this.state.options}
        />
      </React.Fragment>
    );
}

export default MUITable;