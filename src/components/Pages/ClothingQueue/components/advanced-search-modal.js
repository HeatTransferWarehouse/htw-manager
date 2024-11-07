import React, { useRef } from "react";
import { useDrag } from "@use-gesture/react";
import {
  ModalOverlay,
  Modal,
  ModalCloseMobile,
  ModalCloseDesktop,
  ModalContent,
} from "../../../Modal/modal";

export default function AdvancedSearchModal({ props }) {
  const closeRef = useRef(null);
  const bgRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setShowAdvancedSearchModal(false);
    }
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) cancel(props.setShowAdvancedSearchModal(false));
    if (!down && my > 50) props.setShowAdvancedSearchModal(false);
  });
  return (
    <ModalOverlay
      ref={bgRef}
      handleClick={handleOutsideClick}
      open={props.open}>
      <Modal open={props.open}>
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop
          handleClick={() => props.setShowAdvancedSearchModal(false)}
        />
        <ModalContent>
          <p className="text-center font-bold mb-4 text-2xl">
            Advanced Search Query
          </p>
          <div className="my-2">
            <p>
              You are able to make advanced searches for specific columns in the
              table by using this syntax:
            </p>
            <p className="my-2 font-medium">
              {"{"}column_name{"}"}:{"{"}column_value{"}"}
            </p>
            <p>
              You are also able to chain these together by include an{" "}
              <strong>"&"</strong> between them:
            </p>
            <p className="my-2 font-medium">
              {"{"}column{"}"}:{"{"}value{"}"}&{"{"}column_2{"}"}:{"{"}value_2
              {"}"}
            </p>
            <p className="my-2">
              <strong>Note</strong>: these queries are not case sensitive.
            </p>
          </div>
          <div className="my-8">
            <p className="mb-4 font-bold">Available Columns:</p>
            <ul className="flex flex-col gap-2">
              <li>qty</li>
              <li>date (mm/dd/yyyy format)</li>
              <li>sku</li>
              <li>name (product name)</li>
              <li>id (order number)</li>
            </ul>
          </div>
          <div className="my-8">
            <p className="mb-4 font-bold">Example Queries:</p>
            <ul className="flex flex-col gap-2">
              <li>
                Single Query:{" "}
                <span className="font-medium">sku:STOCK-1041</span>
              </li>
              <li>
                Date Query: <span className="font-medium">date:6/24/24</span>
              </li>
              <li>
                Multiple Queries:{" "}
                <span className="font-medium">sku:SDC587&qty:2</span>
              </li>
              <li>
                Multiple Queries for same column:{" "}
                <span className="font-medium">sku:SDC587&sku:STOCK-1041</span>
              </li>
            </ul>
          </div>
          <p className="mt-4">
            <span className="font-bold">Note:</span> Advanced searches are for{" "}
            <strong>EXACT MATCHES</strong>. If you want to filter as you type,
            use a basic search query by simply typing in the value you would
            like to search for.
          </p>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
}
