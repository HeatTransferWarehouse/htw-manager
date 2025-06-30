import React from "react";

function PageNotFound() {
  return (
    <>
      <div className="circle"></div>
      <section className="w-full h-full flex items-center justify-center">
        <div className="flex items-center justify-center gap-4 flex-col">
          <div className="square"></div>
          <h1 className="animate-charcter !m-0 !text-[150px]">404</h1>
          <h4>
            <i>Page not found.</i>
          </h4>
        </div>
      </section>
    </>
  );
}

export default PageNotFound;
