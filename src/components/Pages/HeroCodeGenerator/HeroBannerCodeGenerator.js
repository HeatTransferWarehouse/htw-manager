import React, { useEffect, useRef, useState } from "react";
import { Card } from "../../ui/card";
import { CopyBlock, dracula } from "react-code-blocks";
import { generateCode } from "./generator-function";
import { IoCloseCircle } from "react-icons/io5";

export default function HeroBannerCodeGenerator() {
  const [desktopImageUrl, setDesktopImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [heroBannerTitle, setHeroBannerTitle] = useState("");
  const [heroBannerLink, setHeroBannerLink] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [siteFor, setSiteFor] = useState("htw");
  const [includeMobileImage, setIncludeMobileImage] = useState("yes");
  const [includeLink, setIncludeLink] = useState("yes");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageActive, setPreviewImageActive] = useState(false);

  useEffect(() => {
    if (includeMobileImage === "no") {
      setMobileImageUrl("unset");
    }
    if (includeLink === "no") {
      setHeroBannerLink("unset");
    }
  }, [includeMobileImage]);

  const handleCodeGeneration = () => {
    const newCode = generateCode(
      siteFor,
      desktopImageUrl,
      mobileImageUrl,
      imageAltText,
      heroBannerTitle,
      heroBannerLink,
      includeMobileImage,
      includeLink
    );

    setGeneratedCode(newCode);
    console.log(newCode);
  };

  const viewImagePreview = (url) => {
    setPreviewImageUrl(url);
    setPreviewImageActive(true);
  };

  return (
    <>
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">
        Hero Banner Code Generator
      </h1>
      <div className="flex w-full max-w-screen-lg flex-col mx-auto mt-12">
        <Card width={"lg"}>
          <p className="font-bold text-lg mb-4">General</p>
          <div className="grid grid-cols-3 mb-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm" htmlFor="site_for">
                Site For
              </label>
              <select
                className="border w-full border-gray-300 p-2 rounded-md m-0 text-sm"
                id="site_for"
                onChange={(e) => setSiteFor(e.target.value)}>
                <option value="htw">Heat Transfer Warehouse</option>
                <option value="sff">Shirts From Fargo (headless only)</option>
              </select>
            </div>
            <div className="flex flex-col w-full items-start gap-2">
              <label
                className="font-semibold text-sm"
                htmlFor="include_mobile_image">
                Include Mobile Image
              </label>
              <select
                className="border w-full border-gray-300 p-2 rounded-md m-0 text-sm"
                id="include_mobile_image"
                onChange={(e) => setIncludeMobileImage(e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="flex flex-col items-start gap-2">
              <label
                className="font-semibold text-sm"
                htmlFor="include_mobile_image">
                Include Link
              </label>
              <select
                className="border w-full border-gray-300 p-2 rounded-md m-0 text-sm"
                id="include_mobile_image"
                onChange={(e) => setIncludeLink(e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          <p className="font-bold text-lg mb-4">Image Attributes</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-start gap-2">
              <label
                className="font-semibold text-sm"
                htmlFor="desktop_img_url">
                Desktop Image Url
              </label>
              <input
                className="border border-gray-300 p-2 rounded-md m-0 text-sm w-full"
                id="desktop_img_url"
                type="text"
                onChange={(e) => setDesktopImageUrl(e.target.value)}
                placeholder="https://cdn11.bigcommerce.com/img-name.jpg"
              />
              {desktopImageUrl && desktopImageUrl !== "unset" && (
                <button
                  className="text-secondary text-sm hover:underline"
                  onClick={() => viewImagePreview(desktopImageUrl)}>
                  View Preview
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-semibold items-start text-sm"
                htmlFor="mobile_img_url">
                Mobile Image Url
              </label>
              <input
                className="border border-gray-300 disabled:cursor-not-allowed w-full disabled:bg-gray-300 p-2 rounded-md m-0 text-sm"
                id="mobile_img_url"
                type="text"
                disabled={includeMobileImage === "no"}
                onChange={(e) => setMobileImageUrl(e.target.value)}
                placeholder="https://cdn11.bigcommerce.com/img-name-mobile.jpg"
              />
              {mobileImageUrl && mobileImageUrl !== "unset" && (
                <button
                  className="text-secondary text-sm hover:underline"
                  onClick={() => viewImagePreview(mobileImageUrl)}>
                  View Preview
                </button>
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="font-semibold text-sm" htmlFor="img_alt">
                Image Alt Text
              </label>
              <input
                className="border border-gray-300 p-2 rounded-md m-0 text-sm w-full"
                id="img_alt"
                type="text"
                onChange={(e) => setImageAltText(e.target.value)}
                placeholder="Sale on x items"
              />
            </div>
          </div>
          <p className="font-bold text-lg my-4">Banner Attributes</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-start gap-2">
              <label className="font-semibold text-sm" htmlFor="link_url">
                Link Url
              </label>
              <input
                className="border border-gray-300 disabled:cursor-not-allowed w-full disabled:bg-gray-300 p-2 rounded-md m-0 text-sm"
                id="link_url"
                type="text"
                disabled={includeLink === "no"}
                onChange={(e) => {
                  let cleanUrl = e.target.value;
                  if (
                    e.target.value.includes("https://shirtsfromfargo.com") ||
                    e.target.value.includes("https://heattransferwarehouse.com")
                  ) {
                    cleanUrl = e.target.value
                      .replace("https://shirtsfromfargo.com", "")
                      .replace("https://heattransferwarehouse.com", "");
                  }
                  console.log(cleanUrl);

                  setHeroBannerLink(cleanUrl);
                  e.target.value = cleanUrl;
                }}
                placeholder="/link-to-page/"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="font-semibold text-sm" htmlFor="banner_title">
                Banner Title
              </label>
              <input
                className="border border-gray-300 p-2 rounded-md m-0 text-sm w-full"
                id="banner_title"
                type="text"
                onChange={(e) => setHeroBannerTitle(e.target.value)}
                placeholder="Name of sale, promo, product, etc."
              />
            </div>
          </div>
          <button
            onClick={handleCodeGeneration}
            className="bg-secondary mt-4 text-white font-semibold py-2 px-4 rounded-md">
            Generate Code
          </button>
        </Card>
      </div>
      {generatedCode && (
        <div className="max-w-screen-lg mx-auto my-8">
          <CopyBlock
            text={generatedCode}
            language="html"
            showLineNumbers={false}
            wrapLongLines={true}
            theme={dracula}
          />
        </div>
      )}
      {previewImageActive && (
        <div className="bg-black/50 w-full h-full fixed top-0 left-0 flex items-center justify-between z-[99999]">
          <button
            onClick={() => setPreviewImageActive(false)}
            className="border-none bg-red-600 absolute m-0 p-0 top-8 right-8 h-8 w-8 rounded-full">
            <IoCloseCircle className="fill-white w-full h-full" />
          </button>
          <img
            className="max-h-[70%] m-auto max-w-[70%]"
            src={previewImageUrl}
            alt="preview"
          />
        </div>
      )}
    </>
  );
}
