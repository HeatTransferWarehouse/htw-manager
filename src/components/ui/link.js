import React from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

function TableNavLink({ to, children, active, onClick, className }) {
  return (
    <Link
      className={twMerge(
        className,
        "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md transition font-medium p-2 text-secondary   hover:text-secondary hover:bg-secondary/10 ",
        active && "bg-secondary text-white hover:text-white hover:bg-secondary"
      )}
      to={to}
      onClick={onClick}>
      {children}
    </Link>
  );
}

function CustomLink({
  className,
  children,
  href,
  style = "standard",
  type = "html",
  ...props
}) {
  const styles = {
    button:
      "bg-secondary rounded-md py-2 px-4 text-white hover:bg-secondaryLight",
    standard: "text-black underline hover:text-secondary",
    highlighted: "text-secondary underline hover:text-secondaryLight",
  };

  const types = {
    html: (
      <a
        className={twMerge(className, "transition w-fit flex", styles[style])}
        href={href}
        {...props}>
        {children}
      </a>
    ),
    router: (
      <Link
        className={twMerge(className, "transition w-fit flex", styles[style])}
        to={href}>
        {children}
      </Link>
    ),
  };

  return types[type];
}

export { TableNavLink, CustomLink };
