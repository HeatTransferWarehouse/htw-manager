import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FaCheck } from "react-icons/fa6";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

const Form = ({ children, className, action, onSubmit }) => {
  return (
    <form
      action={action}
      onSubmit={onSubmit}
      className={twMerge("flex items-start flex-col w-full gap-4", className)}>
      {children}
    </form>
  );
};

const Fieldset = ({ children, className }) => {
  return (
    <fieldset
      className={twMerge("flex w-full flex-col items-start gap-2", className)}>
      {children}
    </fieldset>
  );
};

const Label = ({ children, className, htmlFor }) => {
  return (
    <label className={twMerge("font-medium", className)} htmlFor={htmlFor}>
      {children}
    </label>
  );
};

const Input = ({
  type,
  value,
  onChange,
  className,
  placeholder,
  id,
  name,
  required,
  accept,
  readOnly,
}) => {
  return (
    <input
      accept={accept}
      className={twMerge(
        "inline-flex peer m-0 focus-visible:ring-secondary/20 w-full rounded-md border border-gray-300 py-2.5 px-2 text-base placeholder:text-gray-500 focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-4 hover:border-secondary disabled:bg-gray-100 disabled:hover:border-gray-300",
        className
      )}
      id={id}
      name={name}
      readOnly={readOnly}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value || ""}
      required={required}
    />
  );
};

const TextField = ({
  required,
  readOnly,
  htmlFor,
  id,
  label,
  value,
  onChange,
  className,
}) => {
  const [focus, setFocus] = useState(false);
  console.log(value);

  return (
    <div className="relative">
      <fieldset
        className={twMerge(
          "absolute left-2 top-1/2 transition-transform text-base duration-200",
          focus
            ? "-translate-y-10 -translate-x-4 scale-75"
            : value
            ? " -translate-y-10 -translate-x-4 scale-75"
            : "-translate-y-1/2 scale-100"
        )}>
        <legend className="bg-black px-2 text-white">
          <span>{label}</span>
        </legend>
      </fieldset>
      <input
        className={twMerge(
          className,
          "text-white m-0 py-2 p-4  focus:border-white focus:outline-none bg-black border w-full border-white rounded-md"
        )}
        type="text"
        value={value}
        id={id}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        htmlFor={htmlFor}
        onBlur={() => setFocus(false)}
        onFocus={() => setFocus(true)}
      />
    </div>
  );
};

const Select = ({
  value,
  onChange,
  className,
  children,
  id,
  name,
  onClick,
  setOpen,
  open,
  required,
}) => {
  useEffect(() => {
    window.addEventListener("click", (e) => {
      setOpen(false);
    });
  }, [setOpen]);

  return (
    <div className={twMerge("relative ml-1 w-fit flex flex-col", className)}>
      <select
        className={twMerge("sr-only")}
        id={id}
        name={name}
        onChange={onChange}
        required={required}
        value={value}></select>
      <button
        onClick={onClick}
        className={twMerge(
          open && "outline-none border-secondary ring-4 ring-secondary/20",
          "flex items-center justify-between gap-4 focus-visible:ring-secondary/20 w-full border border-gray-300 p-2 rounded-md text-base focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-4 hover:border-secondary disabled:bg-gray-100 disabled:hover:border-gray-300 "
        )}>
        {value}
        {open ? (
          <FaChevronUp className="fill-secondary h-4 w-4" />
        ) : (
          <FaChevronDown className="fill-black group-hover/select:fill-secondary h-4 w-4" />
        )}
      </button>
      {children}
    </div>
  );
};

const OptionSheet = ({ children, className, open, width }) => {
  const [childrenCount, setChildrenCount] = useState(0);

  useEffect(() => {
    const countNestedChildren = (children) => {
      let count = 0;
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          count += 1;
          if (child.props.children) {
            count += countNestedChildren(child.props.children);
          }
        }
      });
      return count;
    };

    setChildrenCount(countNestedChildren(children));
  }, [children]);

  return (
    <div
      className={twMerge(
        open ? "shadow-default" : "h-0",
        "absolute w-full rounded-md top-0 overflow-y-auto left-0 mt-12 bg-white",
        className
      )}
      style={{
        height: open ? `${childrenCount * 2}rem` : "0px",
        maxHeight: "15rem",
        transition: "height 300ms",
        width: width ? width : "fit-content",
      }}>
      {children}
    </div>
  );
};

const Option = ({ value, children, onClick, selectedValue }) => {
  return (
    <span
      className={twMerge(
        value === selectedValue ? "bg-secondary/10 text-secondary" : "",
        "h-4 hover:bg-secondary/10 hover:text-secondary cursor-pointer flex justify-between gap-2 p-4 items-center min-w-fit"
      )}
      value={value}
      onClick={onClick}>
      {children}
      {value === selectedValue ? (
        <FaCheck className="w-4 h-4 fill-secondary" />
      ) : null}
    </span>
  );
};

const RadioGroup = ({ children, className }) => {
  return (
    <div
      className={twMerge("flex flex-col items-start gap-2 w-full", className)}>
      {children}
    </div>
  );
};

const RadioButton = ({
  className,
  name,
  value,
  checked,
  onChange,
  id,
  required,
}) => {
  return (
    <Label htmlFor={id} className="cursor-pointer flex items-center gap-2">
      <input
        className="peer sr-only"
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required={required}
      />
      <span
        className={twMerge(
          checked ? "border-secondary" : "border-black",
          "flex border border-solid items-center justify-center h-6 w-6 rounded-full gap-2",
          className
        )}>
        {checked && <span className="bg-secondary w-4 h-4 rounded-full" />}
      </span>
      {value}
    </Label>
  );
};

export {
  Form,
  Fieldset,
  Label,
  Input,
  Option,
  Select,
  OptionSheet,
  RadioGroup,
  RadioButton,
  TextField,
};
