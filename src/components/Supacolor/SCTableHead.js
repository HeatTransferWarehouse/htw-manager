import React from "react";
import { Button, TableCell, TableHead, TableRow } from "@material-ui/core";
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";

export default function SCTableHead({
  handleSort,
  setSort,
  sort,
  sortField,
  sortDirection,
}) {
  return (
    <TableHead
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}>
      <TableRow style={{ borderBottom: "1px solid rgb(217, 217, 217)" }}>
        <TableCell style={{ width: "5%" }}></TableCell>
        <TableCell style={{ width: "18%" }}>
          <Button
            style={{ width: "80%" }}
            className="th-btns"
            onClick={() => {
              handleSort("customer_name");
              setSort(true);
            }}>
            Customer Name
            {sort && sortField === "customer_name" ? (
              sortDirection === "asc" ? (
                <BiSolidUpArrow style={{ marginLeft: "5px" }} />
              ) : (
                <BiSolidDownArrow style={{ marginLeft: "5px" }} />
              )
            ) : (
              <></>
            )}
          </Button>
        </TableCell>
        <TableCell style={{ width: "13%" }}>
          <Button
            style={{ width: "80%" }}
            className="th-btns"
            onClick={() => {
              handleSort("customerReference");
              setSort(true);
            }}>
            Order #
            {sort && sortField === "customerReference" ? (
              sortDirection === "asc" ? (
                <BiSolidUpArrow style={{ marginLeft: "5px" }} />
              ) : (
                <BiSolidDownArrow style={{ marginLeft: "5px" }} />
              )
            ) : (
              <></>
            )}
          </Button>
        </TableCell>
        <TableCell style={{ width: "13%" }}>
          <Button
            style={{ width: "80%" }}
            className="th-btns"
            onClick={() => {
              handleSort("jobId");
              setSort(true);
            }}>
            Job ID
            {sort && sortField === "jobId" ? (
              sortDirection === "asc" ? (
                <BiSolidUpArrow style={{ marginLeft: "5px" }} />
              ) : (
                <BiSolidDownArrow style={{ marginLeft: "5px" }} />
              )
            ) : (
              <></>
            )}
          </Button>
        </TableCell>
        <TableCell style={{ width: "20%" }}>
          <Button
            style={{ width: "80%" }}
            className="status-container"
            onClick={() => {
              handleSort("status");
              setSort(true);
            }}>
            Status
            {sort && sortField === "status" ? (
              sortDirection === "asc" ? (
                <BiSolidUpArrow style={{ marginLeft: "5px" }} />
              ) : (
                <BiSolidDownArrow style={{ marginLeft: "5px" }} />
              )
            ) : (
              <></>
            )}
          </Button>
        </TableCell>
        <TableCell style={{ width: "15%" }}>
          <Button
            style={{ width: "80%" }}
            onClick={() => {
              handleSort("dateDue");
              setSort(true);
            }}>
            Date Due
            {sort && sortField === "dateDue" ? (
              sortDirection === "asc" ? (
                <BiSolidUpArrow style={{ marginLeft: "5px" }} />
              ) : (
                <BiSolidDownArrow style={{ marginLeft: "5px" }} />
              )
            ) : (
              <></>
            )}
          </Button>
        </TableCell>
        <TableCell style={{ width: "16%" }}></TableCell>
      </TableRow>
    </TableHead>
  );
}
