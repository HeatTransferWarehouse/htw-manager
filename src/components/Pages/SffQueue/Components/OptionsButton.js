import React from "react";
import { useQueueActions } from "../Functions/queue-actions";
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from "../../../ui/dropdown";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { twMerge } from "tailwind-merge";

const OptionsButton = ({ props }) => {
  const {
    startQueueItem,
    completeQueueItem,
    sendBackCompletedQueueItem,
    sendBackProgressQueueItem,
  } = useQueueActions();

  const {
    itemId,
    activeItemId,
    setActiveItemId,
    setDeleteModalActive,
    view,
    setSingleCheckedId,
  } = props;
  return (
    <DropDownContainer
      onClose={(e) => {
        e.stopPropagation();
        setActiveItemId(null);
      }}
      type="popover">
      <DropDownTrigger
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveItemId(itemId);
          setSingleCheckedId(itemId);
        }}>
        <BiDotsHorizontalRounded
          className={twMerge(
            "group-hover/options:fill-secondary transition duration-200 w-6 h-6",
            activeItemId === itemId ? "fill-secondary" : "fill-black"
          )}
        />
      </DropDownTrigger>
      <DropDownContent>
        {view === "new" ? (
          <>
            <DropDownItem
              className="cursor-pointer hover:bg-green-600/10 py-2 px-3 hover:text-green-600"
              onClick={(e) => startQueueItem(e, itemId)}>
              Start
            </DropDownItem>
            <DropDownItem
              className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
              onClick={(e) => {
                completeQueueItem(e, itemId);
              }}>
              Complete
            </DropDownItem>
            <DropDownItem
              className="cursor-pointer hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
              onClick={() => setDeleteModalActive(true)}>
              Delete
            </DropDownItem>
          </>
        ) : view === "progress" ? (
          <>
            <DropDownItem
              className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
              onClick={(e) => {
                completeQueueItem(e, itemId);
              }}>
              Complete
            </DropDownItem>
            <DropDownItem
              className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
              onClick={(e) => sendBackProgressQueueItem(e, itemId)}>
              Send back
            </DropDownItem>
            <DropDownItem
              className="cursor-pointer hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
              onClick={() => setDeleteModalActive(true)}>
              Delete
            </DropDownItem>
          </>
        ) : (
          <>
            <DropDownItem
              className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
              onClick={(e) => sendBackCompletedQueueItem(e, itemId)}>
              Send back
            </DropDownItem>
            <DropDownItem
              className="cursor-pointer hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
              onClick={() => setDeleteModalActive(true)}>
              Delete
            </DropDownItem>
          </>
        )}
      </DropDownContent>
    </DropDownContainer>
  );
};

export default OptionsButton;
