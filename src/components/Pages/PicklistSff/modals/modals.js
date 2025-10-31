import { FaCircleExclamation } from 'react-icons/fa6';

function DeleteModal({ activeOrders, onConfirm, onCancel }) {
  return (
    <div className="bg-black/50 fixed flex w-screen h-screen items-center justify-center top-0 left-0 z-[99999]">
      <div className="bg-white p-4 rounded-md shadow-default flex gap-6 flex-col justify-between items-center">
        <FaCircleExclamation className="h-16 w-16 text-red-600" />
        <h2 className="text-lg text-center">
          Are you sure you want to delete {activeOrders.length > 0 ? 'these orders' : 'this order'}?
        </h2>
        <div className="w-full flex justify-center gap-4 item-center">
          <button className="bg-red-600 rounded-md text-white px-6 py-2 w-fit" onClick={onConfirm}>
            Delete
          </button>
          <button className="bg-gray-200 rounded-md text-black px-6 py-2 w-fit" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
