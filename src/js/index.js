import { claims, claimsTitle, generators } from "./data.js";
import { splitText, pickRandom, getAverageLuminance } from "./helperFunctions.js";

const LOGO_OFFSET_X = 680;
const LOGO_OFFSET_Y = 680;
const LUMINANCE_THRESHOLD = 0.7;

const unrolledGenerators = generators.flatMap(({ url, weight }) => Array(weight).fill(url));

const imageReader = new FileReader();

const logoLight = new Image();
logoLight.src = "public/logo-light.png";

const logoDark = new Image();
logoDark.src = "public/logo-dark.png";


const logoSpolu = new Image();
logoSpolu.src = "public/SPOLU-kampan-2025-crop.png";

let currentImage = new Image();
let currentText = "Test text";
let currentText2 = "Test text";

const rerollImage = async () => {
  const imageData = await fetch(pickRandom(unrolledGenerators));

  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener("load", () => {
      currentImage = image;
      resolve();
    });

    image.crossOrigin = "anonymous";
    image.src = imageData.url;
  });
};

const rerollText = () => {
  currentText = pickRandom(claims);
  currentText2 = pickRandom(claimsTitle);
};

const canvas = document.getElementById("picture");
const ctx = canvas.getContext("2d");
const font = new FontFace("Bebas Neue", "url(public/BebasNeue-Bold.ttf)");
const font_a = new FontFace("Ancizar Serif", "url(public/AncizarSerif-Regular.ttf)");

const initFont = async () => {
  await font.load();
  document.fonts.add(font);
  document.fonts.add(font_a);
};

const setFile = (file) => {
  if (!file.type.startsWith("image/")) {
    return;
  }

  imageReader.readAsDataURL(file);
};

canvas.addEventListener("dragover", (e) => e.preventDefault());

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!e.dataTransfer || e.dataTransfer.files.length <= 0) {
    return;
  }

  setFile(e.dataTransfer.files[0]);
});

const repaintImage = async () => {
  // Clear canvas to black (for transparent images)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Scale image to always fill the canvas
  const scaleX = canvas.width / currentImage.width;
  const scaleY = canvas.height / currentImage.height;
  const scale = Math.max(scaleX, scaleY);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(currentImage, 0, 0);
  ctx.setTransform(); // Reset transform

  // === BOTTOM GREEN TEXT BANNER ===
  const title = inputCustom2.value || currentText2;
  const subtitle = inputCustom.value || currentText;

  const titleFontSize = 60;
  const subtitleFontSize = 30;
  const padding = 20;
  const lineSpacing = 10;
  const totalHeight = padding * 2 + titleFontSize + subtitleFontSize + lineSpacing + 120;
  const bannerY = canvas.height - totalHeight ;

  // Green rectangle across the bottom
  ctx.fillStyle = "#00EA29";
  ctx.fillRect(0, bannerY, canvas.width, totalHeight);

  // Draw title
  ctx.fillStyle = "black";
  ctx.font = `${titleFontSize}px 'Bebas Neue'`;
  ctx.fillText(title, 30, bannerY + padding * 4);

  // Draw subtitle
  ctx.font = `${subtitleFontSize}px 'Ancizar Serif'`;
  ctx.fillText(subtitle, 30, bannerY + padding * 3 + titleFontSize + lineSpacing);

  ctx.drawImage(logoSpolu, LOGO_OFFSET_X, LOGO_OFFSET_Y);

};



imageReader.addEventListener("load", (e) => {
  currentImage = new Image();
  currentImage.addEventListener("load", () => repaintImage());
  currentImage.src = e.target.result;
});

const buttonRandom = document.getElementById("randomize");
buttonRandom.addEventListener("click", async () => {
  rerollText();
  await rerollImage();
  repaintImage();
});

const buttonRandomImg = document.getElementById("randomize-img");
buttonRandomImg.addEventListener("click", async () => {
  await rerollImage();
  repaintImage();
});

const buttonRandomText = document.getElementById("randomize-text");
buttonRandomText.addEventListener("click", () => {
  rerollText();
  repaintImage();
});

const inputCustomImg = document.getElementById("customImage");
inputCustomImg.addEventListener("change", (e) => {
  e.preventDefault();
  if (e.target.files.length <= 0) {
    return;
  }
  setFile(e.target.files[0]);
});
const buttonCustomImg = document.getElementById("customImageBtn");
buttonCustomImg.addEventListener("click", () => {
  inputCustomImg.click();
});

const inputCustom = document.getElementById("customText");
const replaceWithCustomText = async (e) => {
  if (e.type === "input" || inputCustom.value) {
    currentText = inputCustom.value;
    repaintImage();
  }
};
inputCustom.addEventListener("click", replaceWithCustomText);
inputCustom.addEventListener("input", replaceWithCustomText);

const inputCustom2 = document.getElementById("customTextTitle");
const replaceWithCustomText2 = async (e) => {
  if (e.type === "input" || inputCustom2.value) {
    currentText2 = inputCustom2.value;
    repaintImage();
  }
};
inputCustom2.addEventListener("click", replaceWithCustomText2);
inputCustom2.addEventListener("input", replaceWithCustomText2)

const downloadLinkReal = document.createElement("a");
downloadLinkReal.setAttribute("download", "spolu-stat.jpg");
const linkSave = document.getElementById("save");
linkSave.addEventListener("click", (e) => {
  e.preventDefault();
  downloadLinkReal.setAttribute("href", canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
  downloadLinkReal.click();
});

initFont();

rerollText();
rerollImage()
  .then(() => repaintImage());
