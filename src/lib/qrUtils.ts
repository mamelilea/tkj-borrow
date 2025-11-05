import QRCode from "qrcode";


/**
 * 🎨 Generate QR Code bergaya "Rounded Classy" dengan tema krem-coklat dan logo tengah
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const size = 800;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get canvas context");

    // 🌈 Background gradasi krem ke coklat muda
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "#FAF3E0"); // krem lembut
    grad.addColorStop(1, "#D8BFA6"); // coklat muda
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 🔳 QR Code transparan (modul coklat tua)
    const temp = document.createElement("canvas");
    temp.width = size;
    temp.height = size;
    await QRCode.toCanvas(temp, text, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: size,
      color: {
        dark: "#4E342E", // coklat tua utama
        light: "rgba(0,0,0,0)", // transparan biar gradasi tetap terlihat
      },
    });

    // Gabungkan QR ke background
    ctx.drawImage(temp, 0, 0);

    // 🖼️ Logo di tengah
    const logo = new Image();
    logo.src = "/android-chrome-512x512.png"; // Pastikan ada di /public
    logo.crossOrigin = "anonymous";

    await new Promise<void>((resolve) => {
      logo.onload = () => {
        const logoRatio = 0.17;
        const logoSize = Math.floor(size * logoRatio);
        const padding = Math.floor(logoSize * 0.15);
        const bgSize = logoSize + padding * 2;
        const x = (size - bgSize) / 2;
        const y = (size - bgSize) / 2;
        const radius = bgSize * 0.15;

        // 🔶 Rounded putih + shadow halus
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#FFFFFF";
        roundRect(ctx, x, y, bgSize, bgSize, radius);
        ctx.fill();
        ctx.restore();

        // Garis tepi lembut
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(78,52,46,0.15)";
        roundRect(ctx, x, y, bgSize, bgSize, radius);
        ctx.stroke();

        // 🎯 Logo di tengah
        ctx.drawImage(logo, x + padding, y + padding, logoSize, logoSize);
        resolve();
      };
      logo.onerror = () => resolve();
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error generating QR code:", error);
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: { dark: "#4E342E", light: "#FFFFFF" },
    });
  }
};

/** 🔹 Helper: Rounded Rectangle */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 📦 Download hasil QR */
export const downloadQRCode = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/** 🔢 Generate kode peminjaman */
export const generateBorrowingCode = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `PMJ-${year}-${random}`;
};

/**
 * 🧾 Generate kode barang berdasarkan nama (format: TKJ-XXXX)
 * XXXX diambil dari singkatan nama barang.
 * Jika duplikat, akan menambah suffix angka otomatis.
 */
export const generateItemCodeFromName = (
  name: string,
  existingCodes: string[]
): string => {
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const makeAbbrev = (raw: string) => {
    if (!raw) return "XXXX";
    const words = raw
      .split(/[^a-zA-Z0-9]+/)
      .map((w) => w.trim())
      .filter(Boolean);

    let abbrev = words.map((w) => w[0]).join("").slice(0, 4);

    // Jika kurang dari 4 huruf, isi dari huruf dalam nama
    const pool = sanitize(raw);
    let i = 0;
    while (abbrev.length < 4 && i < pool.length) {
      const ch = pool[i];
      if (!abbrev.includes(ch)) abbrev += ch;
      i++;
    }

    return (abbrev + "XXXX").slice(0, 4);
  };

  const base = makeAbbrev(name);
  const existing = new Set(existingCodes);
  let newCode = `TKJ-${base}`;
  let suffix = 1;

  while (existing.has(newCode)) {
    newCode = `TKJ-${base}-${suffix}`;
    suffix++;
  }

  return newCode;
};
