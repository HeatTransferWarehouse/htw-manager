import ImageShimmer from "../../../assets/images/image-shimmer.gif";
import React, { useState } from "react";

export default function Image({ url, ...props }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div {...props} className="relative h-full aspect-square w-full">
      {/* Shimmer Placeholder */}
      {isLoading && (
        <img
          className="absolute inset-0 aspect-square w-full object-cover rounded-md"
          src={ImageShimmer}
          alt="Loading..."
        />
      )}

      {/* Actual Image */}
      <img
        className={`w-full aspect-square object-cover rounded-md transition-opacity ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        src={url ? url : ImageShimmer}
        alt=""
        onLoad={() => {
          setTimeout(() => {
            setIsLoading(false);
          }, 150);
        }} // Set loading to false once loaded
        onError={() => {
          setTimeout(() => {
            setIsLoading(false);
          }, 150);
        }} // Handle load errors
      />
    </div>
  );
}
