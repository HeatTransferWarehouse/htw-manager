import * as React from "react";
import { Toast } from "radix-ui";
import { BiX } from "react-icons/bi";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { CheckCircle, Error, Info } from "@material-ui/icons";

const Toaster = ({
  duration = 3000,
  isOpen,
  variant = "success",
  title,
  onClose,
}) => {
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef(duration);

  const toastStyles = cva(
    "grid grid-cols-[auto_max-content] border border-solid border-gray-400 items-center gap-x-[15px] rounded-md bg-white p-[15px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
    {
      variants: {
        variant: {
          success: "border-green-600 text-green-600",
          error: "  border-red-500 text-red-500",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  );

  const closeToast = () => {
    setOpen(false);
    onClose();
  };

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className={twMerge(toastStyles({ variant }))}
        open={open}
        onOpenChange={closeToast}>
        <Toast.Title className="mb-[5px] flex items-center gap-4 text-[15px] font-medium text-slate12 [grid-area:_title]">
          {variant === "success" ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : variant === "error" ? (
            <Error className="w-6 h-6 text-red-500" />
          ) : (
            <Info className="w-6 h-6 text-black" />
          )}
          {title}
        </Toast.Title>
        <Toast.Action
          className="[grid-area:_action] border border-solid border-transparent hover:border-red-600 group cursor-pointer w-6 h-6 rounded-full flex items-center justify-center"
          altText="Goto schedule to undo">
          <BiX className="w-4 h-4 text-black group-hover:text-red-600" />
        </Toast.Action>
      </Toast.Root>
      <Toast.Viewport className="fixed top-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_16px]" />
    </Toast.Provider>
  );
};

export default Toaster;
