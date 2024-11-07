export const generateCode = (
  siteFor,
  desktopImageUrl,
  mobileImageUrl,
  imageAltText,
  heroBannerTitle,
  heroBannerLink,
  includeMobileImage,
  includeLink
) => {
  if (
    desktopImageUrl &&
    mobileImageUrl &&
    imageAltText &&
    heroBannerTitle &&
    heroBannerLink
  ) {
    let code;
    console.log(siteFor);

    if (siteFor === "htw") {
      code = `
            ${
              includeLink === "yes"
                ? `<a title="${heroBannerTitle}" href="${heroBannerLink}">`
                : ""
            }
              <picture>
                <source
                media="(max-width: 639px)"
                srcset="
                  data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
                " 
                />
                <img
                  width="2160px"
                  height="720px"
                  class="desktop-hero-image"
                  fetchpriority="high"
                  src="${desktopImageUrl}"
                  alt="${imageAltText}"
                />
              </picture>
              ${
                includeMobileImage === "no"
                  ? ""
                  : `
                  <picture>
                  <source
                  media="(min-width: 641px)"
                  srcset="
                  data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
                  " 
                  />
                  <img
                  class="desktop-hero-image-mobile"
                  width="600px"
                  height="600px"
                  fetchpriority="high"
                  src="${mobileImageUrl}"
                  alt="${imageAltText}" 
                  />
                  </picture>
                `
              }
        ${includeLink === "yes" ? `</a>` : ""}
        `;
    }

    if (siteFor === "sff") {
      code = `
      ${includeLink === "yes" ? `<a href="${heroBannerLink}">` : ""}
                <img
                  id="desktop-hero-image"
                  fetchpriority="high"
                  src="${desktopImageUrl}"
                  alt="${imageAltText}"
                />
              ${
                includeMobileImage === "no"
                  ? ""
                  : `
                  <img
                  id="mobile-hero-image"
                  fetchpriority="high"
                  src="${mobileImageUrl}"
                  alt="${imageAltText}" 
                  />
                `
              }
        ${includeLink === "yes" ? `</a>` : ""}
            
        `;
    }
    console.log(code);

    return code;
  } else {
    alert("Please fill out all fields before generating code.");
  }
};
