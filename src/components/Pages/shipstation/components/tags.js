import React from 'react';
import ReactDOM from 'react-dom';
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from '../../../ui/dropdown';
import { twMerge } from 'tailwind-merge';
import { IoClose } from 'react-icons/io5';

function TagsDropdown({ orderTagsList }) {
  const [tagManagementOpen, setTagManagementOpen] = React.useState(false);
  return (
    <>
      <DropDownContainer type="click">
        <DropDownTrigger className="w-full hover:border-secondary border text-lg border-black justify-between">
          Tags
        </DropDownTrigger>
        <DropDownContent>
          <button
            onClick={() => setTagManagementOpen(true)}
            className="w-full hover:text-secondary flex justify-center items-center py-2 border-b border-gray-300"
          >
            Manage Tags
          </button>
          {orderTagsList.length === 0 ? (
            <span className="w-full py-2 flex justify-center text-sm text-gray-600">
              No tags added
            </span>
          ) : (
            orderTagsList.map((tag, index) => (
              <DropDownItem className={twMerge('text-black text-base')}>{tag.name}</DropDownItem>
            ))
          )}
        </DropDownContent>
      </DropDownContainer>
      {tagManagementOpen && (
        <TagManagementModal
          setTagManagementOpen={setTagManagementOpen}
          orderTagsList={orderTagsList}
        />
      )}
    </>
  );
}

const TagManagementModal = ({ setTagManagementOpen, orderTagsList }) => {
  return ReactDOM.createPortal(
    <div className="bg-black/50 w-screen h-screen fixed top-0 left-0 flex items-center justify-center z-[12357]">
      <div className="bg-white w-[450px] overflow-hidden rounded-md">
        <div className="p-2 flex items-center justify-between bg-gray-200">
          <h2 className="text-lg">Manage Tags</h2>
          <IoClose
            onClick={() => setTagManagementOpen(false)}
            className="text-black hover:text-red-600 w-5 h-5"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TagsDropdown;
