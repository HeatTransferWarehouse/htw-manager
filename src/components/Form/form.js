import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FaCheck } from "react-icons/fa6";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

const Form = ({ children, className, action }) => {
  return (
    <form
      action={action}
      className={twMerge(className, "flex items-start flex-col w-full gap-4")}>
      {children}
    </form>
  );
};

const Fieldset = ({ children, className }) => {
  return (
    <fieldset
      className={twMerge(className, "flex w-fit flex-col items-start gap-2")}>
      {children}
    </fieldset>
  );
};

const Label = ({ children, className, htmlFor }) => {
  return (
    <label className={twMerge(className, "font-medium")} htmlFor={htmlFor}>
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
}) => {
  return (
    <input
      className={twMerge(
        className,
        "inline-flex peer focus-visible:ring-secondary/20 w-full rounded-md border border-gray-300 py-2.5 px-2 text-base placeholder:text-gray-500 focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-4 hover:border-secondary disabled:bg-gray-100 disabled:hover:border-gray-300"
      )}
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value}
      required={required}
    />
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
    <div className={twMerge(className, "relative ml-1 w-fit flex flex-col")}>
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

const OptionSheet = ({ children, className, open }) => {
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
        className,
        open ? "shadow-default" : "h-0",
        "absolute w-full rounded-md top-0 overflow-y-auto left-0 mt-12 bg-white"
      )}
      style={{
        height: open ? `${childrenCount * 2}rem` : "0px",
        maxHeight: "15rem",
        transition: "height 300ms",
        width: "fit-content",
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
      className={twMerge(className, "flex flex-col items-start gap-2 w-full")}>
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
          className,
          checked ? "border-secondary" : "border-black",
          "flex border border-solid items-center justify-center h-6 w-6 rounded-full gap-2"
        )}>
        {checked && <span className="bg-secondary w-4 h-4 rounded-full" />}
      </span>
      {value}
    </Label>
  );
};

const SubmitButton = ({ children, className, onClick }) => {
  return (
    <button
      className={twMerge(
        className,
        "bg-secondary text-white py-2 px-4 mt-4 rounded-md hover:bg-secondary-darker disabled:bg-gray-100 disabled:hover:bg-gray-100"
      )}
      onClick={onClick}>
      {children}
    </button>
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
  SubmitButton,
};