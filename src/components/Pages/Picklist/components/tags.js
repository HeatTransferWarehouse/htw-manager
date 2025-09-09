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
import { FaChevronDown, FaMinus, FaPlus } from 'react-icons/fa6';
import { HexColorPicker } from 'react-colorful';

function TagsDropdown({ orderTagsList }) {
  const [tagManagementOpen, setTagManagementOpen] = React.useState(false);
  const [tagAddOpen, setTagAddOpen] = React.useState(false);
  const [tags, setTags] = React.useState(orderTagsList);
  const [newTags, setNewTags] = React.useState([]);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  return (
    <>
      <DropDownContainer type="click">
        <DropDownTrigger className="w-full hover:border-secondary border text-lg border-black justify-between">
          Tags
        </DropDownTrigger>
        <DropDownContent className={'!w-[150px]'}>
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
          orderTagsList={orderTagsList}
          setTagManagementOpen={setTagManagementOpen}
          setTagAddOpen={setTagAddOpen}
          tagAddOpen={tagAddOpen}
          setTags={setTags}
        />
      )}
      {tagAddOpen && (
        <TagAddModal
          setTagAddOpen={setTagAddOpen}
          tags={tags}
          setTags={setTags}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
        />
      )}
    </>
  );
}

const TagManagementModal = ({
  setTagManagementOpen,
  orderTagsList,
  tagAddOpen,
  setTagAddOpen,
  setTags,
}) => {
  return ReactDOM.createPortal(
    <div className="bg-black/50 w-screen h-screen fixed top-0 left-0 flex items-center justify-center z-[12357]">
      <div
        className={twMerge(
          'bg-white w-[450px] overflow-hidden rounded-md',
          tagAddOpen && 'brightness-50'
        )}
      >
        <div className="p-2 flex items-center justify-between bg-gray-200">
          <h2 className="text-lg">Manage Tags</h2>
          <IoClose
            onClick={() => setTagManagementOpen(false)}
            className="text-black hover:text-red-600 w-5 h-5"
          />
        </div>
        <div className="flex flex-col items-start">
          {orderTagsList.length === 0 ? (
            <span className="w-full py-6 flex justify-center text-sm text-gray-600">
              No tags added
            </span>
          ) : (
            orderTagsList.map((tag, index) => (
              <div key={index} className="px-4 py-2 border-b border-gray-300 w-full">
                <span className="text-black text-base">{tag.name}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex w-full p-2 justify-between items-center border-t border-gray-300">
          <button
            onClick={() => {
              setTagAddOpen(true);
              setTags([...orderTagsList, { name: '', color: '#000000' }]);
            }}
            className="flex items-center gap-1 text-black hover:text-secondary"
          >
            New Tag <FaPlus className="w-3 h-3" />
          </button>
          <button
            className="bg-secondary px-4 py-1 text-white hover:bg-secondaryLight rounded-md"
            onClick={() => setTagManagementOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TagAddModal = ({ setTagAddOpen, tags, setTags, showColorPicker, setShowColorPicker }) => {
  const [buttonPosition, setButtonPosition] = React.useState({ x: 0, y: 0 });
  return ReactDOM.createPortal(
    <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center z-[12357]">
      <div className="bg-white w-[450px] overflow-hidden rounded-md">
        <div className="p-2 flex items-center justify-between bg-gray-200">
          <h2 className="text-lg">New Tag</h2>
          <IoClose
            onClick={() => setTagAddOpen(false)}
            className="text-black hover:text-red-600 w-5 h-5"
          />
        </div>
        <div className="flex flex-col items-start">
          {tags.map((tag, index) => (
            <div key={index} className="w-full flex items-center gap-2 px-2 pb-3 first:pt-3">
              {tags.length > 1 && (
                <button
                  onClick={() => {
                    const newTags = tags.filter((_, i) => i !== index);
                    setTags(newTags);
                  }}
                  className="w-3 h-3 rounded-full bg-red-600 text-white flex items-center justify-center"
                >
                  <FaMinus className="w-2 h-2" />
                </button>
              )}
              <input
                id="tag-name"
                type="text"
                placeholder="Tag Name"
                value={tag.name}
                onChange={(e) => {
                  const newTags = [...tags];
                  newTags[index].name = e.target.value;
                  setTags(newTags);
                }}
                className="flex-grow border border-gray-300 rounded-md p-2 m-0"
              />
              <button
                onClick={(e) => {
                  setShowColorPicker(index); // store which tag's picker is open
                  const rect = e.currentTarget.getBoundingClientRect();
                  setButtonPosition({
                    x: rect.x,
                    y: rect.y,
                    height: rect.height,
                    width: rect.width,
                    documentWidth: document.body.clientWidth,
                  });
                }}
                className="w-fit p-1 rounded-md flex border border-gray-300 items-center gap-2"
              >
                <span
                  className="w-8 h-8 rounded-md border border-gray-300"
                  style={{
                    backgroundColor: tag.color,
                  }}
                />
                <FaChevronDown className="w-3 h-3" />
              </button>
              {showColorPicker === index && (
                <div
                  className="bg-white p-2 rounded-xl border border-gray-200 shadow-lg"
                  style={{
                    position: 'fixed',
                    top: buttonPosition.y + buttonPosition.height + 8,
                    right: buttonPosition.documentWidth - buttonPosition.x - buttonPosition.width,
                  }}
                >
                  <HexColorPicker
                    color={tag.color}
                    onChange={(color) => {
                      const newTags = [...tags];
                      newTags[index].color = color;
                      setTags(newTags);
                    }}
                  />
                  <div className="flex items-center justify-between pt-2">
                    <input
                      className="border border-black p-1 w-[77px] rounded-md m-0"
                      type="text"
                      value={tag.color}
                      onChange={(e) => {
                        const newTags = [...tags];
                        newTags[index].color = e.target.value;
                        setTags(newTags);
                      }}
                    />
                    <button
                      className="bg-secondary text-white py-1 px-2 rounded"
                      onClick={() => {
                        setShowColorPicker(false);
                        setButtonPosition(null);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="w-full flex justify-between p-2 border-t border-gray-300">
            <button
              onClick={() => {
                setTags([...tags, { name: '', color: '#000000' }]);
              }}
              className="flex items-center gap-1 text-black hover:text-secondary"
            >
              Add Tag <FaPlus className="w-3 h-3" />
            </button>
            <button className="bg-secondary text-white px-4 py-1 rounded-md">Save</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TagsDropdown;
