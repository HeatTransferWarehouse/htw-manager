import React, { useEffect, useRef, useState } from "react";
import CustomImageUpload from "../../ui/image-upload";
import { twMerge } from "tailwind-merge";
import { BiX } from "react-icons/bi";

function RhineStoneMockUp() {
  const canvasRef = useRef(null);
  const fullscreenCanvasRef = useRef(null); // Second canvas for fullscreen view
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const currentAspectRatio = useRef(0);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Get device pixel ratio (for HiDPI screens)
        const dpr = window.devicePixelRatio || 1;

        const aspectRatio = img.width / img.height;

        // Get image dimensions
        const imgWidth = img.width > 700 ? 700 : img.width;
        const imgHeight =
          img.height > 700 ? imgWidth / aspectRatio : img.height;

        // Set the actual resolution of the canvas
        canvas.width = imgWidth * dpr;
        canvas.height = imgHeight * dpr;

        // Set the canvas display size (CSS)
        canvas.style.width = `${imgWidth}px`;
        canvas.style.height = `${imgHeight}px`;
        canvas.style.aspectRatio = `${imgWidth / imgHeight}`;

        // Scale the drawing context to account for DPR
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Draw the image at normal size (fixes quarter-display issue)
        ctx.drawImage(img, 0, 0, imgWidth / dpr, imgHeight / dpr);

        // Apply the rhinestone effect
        applyRhinestoneEffect(ctx, imgWidth, imgHeight, dpr);

        setFile(file);
      };
    };
  };

  const applyRhinestoneEffect = (ctx, width, height, dpr) => {
    setLoading(true);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    const rhinestoneImage = new Image();
    rhinestoneImage.src = "/images/rhinestone.png";

    rhinestoneImage.onload = () => {
      requestAnimationFrame(() => {
        const gridSize = 15; // Scale grid spacing
        const stoneSize = 12; // Scale rhinestone size

        for (let y = 0; y < height; y += gridSize) {
          for (let x = 0; x < width; x += gridSize) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;

            // 🎯 **Scale placement to match high DPI correctly**
            const halfSize = stoneSize / 2;
            const centerX = x + gridSize / 2;
            const centerY = y + gridSize / 2;

            ctx.drawImage(
              rhinestoneImage,
              x + 1.5,
              y + 1.5,
              stoneSize,
              stoneSize
            );

            // 🎨 **Enhance color vibrancy using `hard-light` instead of `overlay`**
            ctx.globalCompositeOperation = "color-burn";
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;

            ctx.beginPath();
            ctx.arc(centerX, centerY, halfSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = "source-over";

            // 🎇 **Sharper Highlight Effect**
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

            ctx.beginPath();
            ctx.moveTo(centerX - 4 * dpr, centerY - 4 * dpr);
            ctx.lineTo(centerX, centerY - 5 * dpr);
            ctx.lineTo(centerX - 5 * dpr, centerY);
            ctx.closePath();
            ctx.fill();

            ctx.globalCompositeOperation = "source-over";
          }
        }
        setLoading(false);
      });
    };

    rhinestoneImage.onerror = () => {
      console.error("Failed to load rhinestone image!");
    };
  };

  const openFullScreen = () => {
    setIsFullScreen(true);
    const mainCanvas = canvasRef.current;
    const fullscreenCanvas = fullscreenCanvasRef.current;
    if (mainCanvas && fullscreenCanvas) {
      fullscreenCanvas.width = mainCanvas.width;
      fullscreenCanvas.height = mainCanvas.height;
      const fsCtx = fullscreenCanvas.getContext("2d");
      fsCtx.drawImage(mainCanvas, 0, 0);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center max-w-screen-xl mx-auto p-4">
      <a href="https://www.heattransferwarehouse.com/">
        <img
          className="w-48 h-auto"
          src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/heat-transfer-warehouse-logo-2024.png?t=1710348082"
          alt="HTW"
        />
      </a>
      <h1 className="text-2xl">Generate your Rhinestone Mockup</h1>
      <div
        className={twMerge(
          "bg-white rounded overflow-hidden relative",
          file ? "block" : "hidden"
        )}>
        {file && (
          <button
            className="flex absolute top-2 right-2 rounded-full items-center justify-center w-6 h-6 bg-red-600"
            onClick={() => setFile(null)}>
            <BiX className="w-4 h-4 fill-white" />
          </button>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <p>Loading...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={"w-auto max-w-full max-h-full max-sm:!h-auto bg-white"}
        />
        {file && (
          <button
            className="absolute bottom-2 right-2 px-3 py-1 text-white bg-blue-600 rounded"
            onClick={openFullScreen}>
            View Fullscreen
          </button>
        )}
      </div>
      <div
        className={twMerge(
          "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50",
          isFullScreen ? "flex" : "hidden"
        )}>
        <div className="relative w-full h-full bg-white flex items-center justify-center">
          <button
            className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full"
            onClick={() => setIsFullScreen(false)}>
            <BiX size={24} />
          </button>
          <canvas
            ref={fullscreenCanvasRef}
            className="w-auto h-auto max-w-[95%] max-h-[95%]"
          />
        </div>
      </div>
      <CustomImageUpload handleImageChange={handleImageChange} file={file} />
    </div>
  );
}

export default RhineStoneMockUp;
