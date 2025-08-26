import React from 'react';
import { Close } from '@material-ui/icons';

import { twMerge } from 'tailwind-merge';
import { FaCheck } from 'react-icons/fa6';
import ReactDOM from 'react-dom';
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from '../../../ui/dropdown';

export default function PrintModal({
  open,
  generatingPDF,
  pdfUrl,
  printersList,
  selectedPrinter,
  setSelectedPrinter,
  markPrinterAsDefault,
  sendToPrinter,
  onClose,
}) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-0 right-0 bg-black/50 w-full h-full z-50 flex items-center justify-center">
      <div className="bg-white w-[1300px] overflow-hidden rounded shadow-lg">
        {/* Header */}
        <div className="p-2 flex items-center justify-between shadow-default bg-gray-200 ">
          <h2 className="text-lg">Print Preview</h2>
          <Close className="hover:text-secondary cursor-pointer" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="grid grid-cols-[800px_1fr]">
          {/* PDF Preview */}
          {pdfUrl && (
            <iframe
              src={`${pdfUrl}#zoom=65`}
              width="100%"
              height="800px"
              style={{ border: '1px solid #ccc', display: 'block' }}
              title="Print Preview"
            ></iframe>
          )}

          {/* Printer Settings */}
          <div>
            <div className="flex flex-col items-start w-full mt-4 px-2 gap-2 mb-4">
              <label className="text-lg font-medium" htmlFor="printer">
                Printer Selection
              </label>
              <DropDownContainer className="w-full" type="click">
                <DropDownTrigger className="w-full border border-black justify-between">
                  {selectedPrinter?.alias || 'Select Printer'}
                </DropDownTrigger>
                <DropDownContent style={{ width: '100%' }} className="w-full">
                  {printersList.map((printer, idx) => (
                    <DropDownItem
                      className={twMerge(
                        'flex items-center justify-between',
                        printer.name === selectedPrinter?.name ? 'bg-secondary/5' : ''
                      )}
                      onClick={() => setSelectedPrinter(printer)}
                      key={idx}
                    >
                      <span>
                        {printer.alias}{' '}
                        <span className="text-sm text-gray-500">
                          {printer.is_default ? '(Default)' : ''}
                        </span>
                      </span>
                      <span>
                        <button
                          className="flex text-[12px] text-black hover:text-secondary group items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            markPrinterAsDefault(printer.name);
                          }}
                        >
                          Default
                          <span
                            className={twMerge(
                              'w-4 h-4 border flex items-center justify-center group-hover:border-secondary  rounded-[2px]',
                              printer.is_default
                                ? 'bg-secondary border-secondary'
                                : 'border-black bg-white'
                            )}
                          >
                            {printer.is_default && <FaCheck className="text-white w-3 h-3" />}
                          </span>
                        </button>
                      </span>
                    </DropDownItem>
                  ))}
                </DropDownContent>
              </DropDownContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex w-full items-center justify-end p-2 border-t border-gray-200 gap-4">
          <button
            className="hover:text-secondary border rounded border-black px-3 py-1 hover:border-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={!selectedPrinter || generatingPDF}
            className="bg-secondary hover:bg-secondaryLight text-white rounded px-3 py-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={sendToPrinter}
          >
            {generatingPDF ? 'Generating...' : 'Print Picklist'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
