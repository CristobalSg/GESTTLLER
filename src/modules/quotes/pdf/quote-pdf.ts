import type { QuoteWithRelations } from "../use-quotes-storage";
import { buildQuotePdfTemplate, type QuotePdfTemplate } from "./quote-pdf-template";

type PdfPageState = {
  commands: string[];
  cursorY: number;
};

type RgbColor = [number, number, number];

type PdfImageAsset = {
  height: number;
  hexData: string;
  name: string;
  width: number;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const FONT_FAMILY = "Helvetica";
const BRAND_COLOR: RgbColor = [1, 0.42, 0.17];
const DARK_COLOR: RgbColor = [0.14, 0.13, 0.12];
const MUTED_COLOR: RgbColor = [0.39, 0.36, 0.34];
const LIGHT_FILL: RgbColor = [0.97, 0.96, 0.95];
const WHITE_COLOR: RgbColor = [1, 1, 1];

function toPdfHex(value: string) {
  const bytes = Array.from(value).map((character) => {
    const code = character.charCodeAt(0);
    return Math.min(code, 255).toString(16).padStart(2, "0");
  });

  return `<${bytes.join("")}>`;
}

function createPage(): PdfPageState {
  return {
    commands: [],
    cursorY: PAGE_HEIGHT - PAGE_MARGIN,
  };
}

function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.52;
}

function formatColorValue(value: number) {
  return value.toFixed(3).replace(/0+$/g, "").replace(/\.$/g, "");
}

function getRgbCommand(color: RgbColor, operator: "rg" | "RG") {
  return `${color.map(formatColorValue).join(" ")} ${operator}`;
}

function wrapText(text: string, fontSize: number, maxWidth: number) {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function addText(
  page: PdfPageState,
  text: string,
  options: { color?: RgbColor; size?: number; x: number; y: number }
) {
  const size = options.size ?? 12;
  if (options.color) {
    page.commands.push(getRgbCommand(options.color, "rg"));
  }
  page.commands.push(`BT /F1 ${size} Tf 1 0 0 1 ${options.x} ${options.y} Tm ${toPdfHex(text)} Tj ET`);
}

function addRule(
  page: PdfPageState,
  x: number,
  y: number,
  width: number,
  options?: { color?: RgbColor; lineWidth?: number }
) {
  if (options?.color) {
    page.commands.push(getRgbCommand(options.color, "RG"));
  }
  if (options?.lineWidth) {
    page.commands.push(`${options.lineWidth} w`);
  }
  page.commands.push(`${x} ${y} m ${x + width} ${y} l S`);
}

function addBox(
  page: PdfPageState,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { fillColor?: RgbColor; lineWidth?: number; strokeColor?: RgbColor }
) {
  if (options?.strokeColor) {
    page.commands.push(getRgbCommand(options.strokeColor, "RG"));
  }
  if (options?.fillColor) {
    page.commands.push(getRgbCommand(options.fillColor, "rg"));
  }
  if (options?.lineWidth) {
    page.commands.push(`${options.lineWidth} w`);
  }
  page.commands.push(
    `${x} ${y} ${width} ${height} re ${options?.fillColor && options?.strokeColor ? "B" : options?.fillColor ? "f" : "S"}`
  );
}

function addImage(page: PdfPageState, imageName: string, x: number, y: number, width: number, height: number) {
  page.commands.push(`q ${width} 0 0 ${height} ${x} ${y} cm /${imageName} Do Q`);
}

async function loadLogoImageAsset(): Promise<PdfImageAsset | undefined> {
  if (typeof window === "undefined") {
    return undefined;
  }

  const image = new Image();
  image.decoding = "async";
  image.src = "/icons/icon-512x512.webp";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("No fue posible cargar el logo para el PDF."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    return undefined;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) {
    return undefined;
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const hexData = `${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}>`;

  return {
    height: canvas.height,
    hexData,
    name: "Im1",
    width: canvas.width,
  };
}

function ensureSpace(pages: PdfPageState[], requiredHeight: number) {
  let currentPage = pages[pages.length - 1];

  if (currentPage.cursorY - requiredHeight < PAGE_MARGIN) {
    currentPage = createPage();
    pages.push(currentPage);
  }

  return currentPage;
}

function renderHeader(page: PdfPageState, template: QuotePdfTemplate, logo?: PdfImageAsset) {
  const headerTop = page.cursorY;
  const logoSize = 74;

  page.commands.push("0.4 w");
  addText(page, template.workshopName, { x: PAGE_MARGIN, y: headerTop - 2, size: 22, color: DARK_COLOR });
  template.workshopDetails.forEach((detail, index) => {
    addText(page, detail, { x: PAGE_MARGIN, y: headerTop - 24 - index * 14, size: 10, color: MUTED_COLOR });
  });

  if (logo) {
    addImage(page, logo.name, PAGE_WIDTH - PAGE_MARGIN - logoSize, headerTop - logoSize + 4, logoSize, logoSize);
  }

  addText(page, template.title, { x: PAGE_MARGIN, y: headerTop - 64, size: 18, color: BRAND_COLOR });
  addText(page, `Nro. presupuesto: ${template.quoteNumber}`, {
    x: PAGE_MARGIN,
    y: headerTop - 84,
    size: 10,
    color: DARK_COLOR,
  });
  addText(page, `Fecha emision: ${template.issueDate}`, {
    x: PAGE_MARGIN + 170,
    y: headerTop - 84,
    size: 10,
    color: DARK_COLOR,
  });
  addText(page, `Valido hasta: ${template.validUntil}`, {
    x: PAGE_MARGIN + 330,
    y: headerTop - 84,
    size: 10,
    color: DARK_COLOR,
  });
  addRule(page, PAGE_MARGIN, headerTop - 98, CONTENT_WIDTH, { color: [0.86, 0.84, 0.82], lineWidth: 0.8 });
  page.cursorY -= 118;
}

function renderInfoBlock(
  pages: PdfPageState[],
  title: string,
  lines: string[],
  x: number,
  y: number,
  width: number
) {
  const page = pages[pages.length - 1];
  const height = 78;
  addBox(page, x, y - height, width, height, {
    fillColor: LIGHT_FILL,
    lineWidth: 0.8,
    strokeColor: [0.86, 0.84, 0.82],
  });
  addText(page, title, { x: x + 12, y: y - 18, size: 10, color: BRAND_COLOR });
  lines.forEach((line, index) => {
    addText(page, line, { x: x + 12, y: y - 36 - index * 14, size: 10, color: DARK_COLOR });
  });
}

function renderItemsTable(pages: PdfPageState[], template: QuotePdfTemplate) {
  let page = ensureSpace(pages, 80);
  addText(page, "Items cotizados", { x: PAGE_MARGIN, y: page.cursorY, size: 12, color: BRAND_COLOR });
  page.cursorY -= 20;

  const columns = {
    description: PAGE_MARGIN + 10,
    quantity: 360,
    unitPrice: 420,
    total: 500,
  };

  addBox(page, PAGE_MARGIN, page.cursorY - 22, CONTENT_WIDTH, 22, {
    fillColor: DARK_COLOR,
    strokeColor: DARK_COLOR,
    lineWidth: 0.8,
  });
  addText(page, "Descripcion", { x: columns.description, y: page.cursorY - 15, size: 10, color: WHITE_COLOR });
  addText(page, "Cant.", { x: columns.quantity, y: page.cursorY - 15, size: 10, color: WHITE_COLOR });
  addText(page, "Unitario", { x: columns.unitPrice, y: page.cursorY - 15, size: 10, color: WHITE_COLOR });
  addText(page, "Total", { x: columns.total, y: page.cursorY - 15, size: 10, color: WHITE_COLOR });
  page.cursorY -= 28;

  template.items.forEach((item) => {
    const descriptionLines = wrapText(item.description, 10, 250);
    const rowHeight = Math.max(26, descriptionLines.length * 14 + 12);
    page = ensureSpace(pages, rowHeight + 12);

    addBox(page, PAGE_MARGIN, page.cursorY - rowHeight, CONTENT_WIDTH, rowHeight, {
      fillColor: WHITE_COLOR,
      lineWidth: 0.6,
      strokeColor: [0.86, 0.84, 0.82],
    });
    descriptionLines.forEach((line, index) => {
      addText(page, line, { x: columns.description, y: page.cursorY - 16 - index * 14, size: 10, color: DARK_COLOR });
    });
    addText(page, item.quantity, { x: columns.quantity, y: page.cursorY - 16, size: 10, color: DARK_COLOR });
    addText(page, item.unitPrice, { x: columns.unitPrice, y: page.cursorY - 16, size: 10, color: DARK_COLOR });
    addText(page, item.total, { x: columns.total, y: page.cursorY - 16, size: 10, color: DARK_COLOR });
    page.cursorY -= rowHeight + 6;
  });
}

function renderParagraphSection(
  pages: PdfPageState[],
  title: string,
  content: string | string[],
  size = 10
) {
  const lines = Array.isArray(content)
    ? content.flatMap((line) => wrapText(line, size, CONTENT_WIDTH - 20))
    : wrapText(content, size, CONTENT_WIDTH - 20);

  let page = ensureSpace(pages, 40 + lines.length * 14);
  addText(page, title, { x: PAGE_MARGIN, y: page.cursorY, size: 12, color: BRAND_COLOR });
  page.cursorY -= 18;

  const boxHeight = Math.max(50, lines.length * 14 + 18);
  addBox(page, PAGE_MARGIN, page.cursorY, CONTENT_WIDTH, -boxHeight, {
    fillColor: LIGHT_FILL,
    lineWidth: 0.8,
    strokeColor: [0.86, 0.84, 0.82],
  });
  lines.forEach((line, index) => {
    addText(page, line, { x: PAGE_MARGIN + 10, y: page.cursorY - 18 - index * 14, size, color: DARK_COLOR });
  });
  page.cursorY -= boxHeight + 18;
}

function renderTotals(pages: PdfPageState[], template: QuotePdfTemplate) {
  let page = ensureSpace(pages, 80);
  const boxWidth = 220;
  const x = PAGE_WIDTH - PAGE_MARGIN - boxWidth;
  addBox(page, x, page.cursorY, boxWidth, -60, {
    fillColor: DARK_COLOR,
    strokeColor: DARK_COLOR,
    lineWidth: 0.8,
  });
  addText(page, "Subtotal", { x: x + 14, y: page.cursorY - 18, size: 10, color: WHITE_COLOR });
  addText(page, template.subtotal, { x: x + 118, y: page.cursorY - 18, size: 10, color: WHITE_COLOR });
  addText(page, "Total", { x: x + 14, y: page.cursorY - 42, size: 12, color: BRAND_COLOR });
  addText(page, template.total, { x: x + 118, y: page.cursorY - 42, size: 12, color: WHITE_COLOR });
  page.cursorY -= 80;
}

function buildPdf(pages: PdfPageState[], imageAsset?: PdfImageAsset) {
  const objects: string[] = [];
  const fontObjectNumber = 3 + pages.length * 2;
  const imageObjectNumber = imageAsset ? fontObjectNumber + 1 : undefined;

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const pageReferences = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(`<< /Type /Pages /Count ${pages.length} /Kids [${pageReferences}] >>`);

  pages.forEach((page) => {
    const content = `q\n${page.commands.join("\n")}\nQ`;
    const contentObjectNumber = objects.length + 2;
    const xObjectResource = imageAsset && imageObjectNumber ? ` /XObject << /${imageAsset.name} ${imageObjectNumber} 0 R >>` : "";
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >>${xObjectResource} >> /Contents ${contentObjectNumber} 0 R >>`
    );
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONT_FAMILY} >>`);

  if (imageAsset) {
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${imageAsset.width} /Height ${imageAsset.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${imageAsset.hexData.length} >>\nstream\n${imageAsset.hexData}\nendstream`
    );
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export async function createQuotePdfBlob(quote: QuoteWithRelations) {
  const template = buildQuotePdfTemplate(quote);
  const logoImage = await loadLogoImageAsset().catch(() => undefined);
  const pages = [createPage()];
  const firstPage = pages[0];

  firstPage.commands.push(getRgbCommand(DARK_COLOR, "rg"));
  firstPage.commands.push(getRgbCommand(DARK_COLOR, "RG"));
  renderHeader(firstPage, template, logoImage);
  renderInfoBlock(pages, "Cliente", template.clientLines, PAGE_MARGIN, firstPage.cursorY, 240);
  renderInfoBlock(pages, "Vehiculo", template.vehicleLines, PAGE_MARGIN + 255, firstPage.cursorY, 244);
  firstPage.cursorY -= 92;
  renderParagraphSection(pages, "Observaciones generales", template.observations);
  renderItemsTable(pages, template);
  renderTotals(pages, template);
  renderParagraphSection(pages, "Condiciones", template.conditions);

  return {
    blob: buildPdf(pages, logoImage),
    fileName: template.fileName,
  };
}

export function downloadQuotePdf(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canSharePdfFile(file: File) {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function"
    ? navigator.canShare({ files: [file] })
    : false;
}

export async function shareQuotePdfFile(file: File) {
  await navigator.share({
    files: [file],
    title: "Presupuesto",
    text: "Adjunto presupuesto en formato PDF.",
  });
}
