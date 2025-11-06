import QRCodeStyling from "qr-code-styling";

/**
 * Generate a framed PNG 1080x1350 containing a centered, non-stretched QR code
 * and an optional label beneath it. The QR modules are filled with a
 * brown->cream vertical gradient. Returns a data URL (image/png).
 */
export const generateQRCode = async (
  text: string,
  label?: string
): Promise<string> => {
  // final output size (4:5) requested by user
  const OUT_W = 1080;
  const OUT_H = 1350;
  // QR square side. Leave margins and space for label.
  const QR_SIDE = 900; // fits comfortably within 1080 width
  const qrX = Math.round((OUT_W - QR_SIDE) / 2);
  const qrY = 80; // top margin

  // Use qr-code-styling to render a transparent-background QR at QR_SIDE
  return new Promise<string>((resolve, reject) => {
    try {
      const qr = new QRCodeStyling({
        width: QR_SIDE,
        height: QR_SIDE,
        type: "canvas",
        data: text,
        margin: 8,
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        // render modules in solid black, we'll mask with gradient later
        dotsOptions: {
          color: "#000000",
          type: "rounded",
        },
        backgroundOptions: {
          color: "transparent",
        },
      });

      // offscreen container for library to render into
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = `${QR_SIDE}px`;
      container.style.height = `${QR_SIDE}px`;
      document.body.appendChild(container);
      qr.append(container);

      const tryGetRawData = async (): Promise<string | null> => {
        try {
          const anyQr: any = qr as any;
          if (typeof anyQr.getRawData === "function") {
            const blob: Blob = await anyQr.getRawData("png");
            return await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(String(reader.result));
              reader.onerror = () => rej(new Error("Failed to read blob"));
              reader.readAsDataURL(blob);
            });
          }
        } catch (e) {
          // continue to polling fallback
        }
        return null;
      };

      const getCanvasFromContainer = (): HTMLCanvasElement | null => {
        const c = container.querySelector("canvas") as HTMLCanvasElement | null;
        return c;
      };

      (async () => {
        // try fast path
        const raw = await tryGetRawData();
        let qrDataUrl: string | null = null;
        if (raw) {
          qrDataUrl = raw;
        } else {
          // poll for rendered canvas
          let attempts = 0;
          const maxAttempts = 40;
          const delay = 100;
          while (attempts < maxAttempts) {
            const canv = getCanvasFromContainer();
            if (canv) {
              try {
                qrDataUrl = canv.toDataURL("image/png");
                break;
              } catch (e) {
                // try again
              }
            }
            // wait
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, delay));
            attempts++;
          }
        }

        if (!qrDataUrl) {
          if (container.parentNode) container.parentNode.removeChild(container);
          return reject(new Error("Failed to obtain QR rendering"));
        }

        // create an Image from the QR dataURL
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          try {
            // final canvas
            const final = document.createElement("canvas");
            final.width = OUT_W;
            final.height = OUT_H;
            const ctx = final.getContext("2d");
            if (!ctx) throw new Error("Unable to get canvas context");

            // white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, OUT_W, OUT_H);

            // draw vertical gradient over QR area
            const grad = ctx.createLinearGradient(qrX, qrY, qrX, qrY + QR_SIDE);
            // brown -> cream
            grad.addColorStop(0, "#8B5E3C");
            grad.addColorStop(1, "#FBF6EF");
            ctx.fillStyle = grad;
            ctx.fillRect(qrX, qrY, QR_SIDE, QR_SIDE);

            // mask gradient so it only shows where QR modules are
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(qrImg, qrX, qrY, QR_SIDE, QR_SIDE);

            // restore normal drawing
            ctx.globalCompositeOperation = "source-over";

            // draw label if provided
            if (label) {
              const padding = 80;
              const maxTextWidth = OUT_W - padding * 2;
              // dynamic font sizing
              let fontSize = 64;
              ctx.fillStyle = "#4E342E"; // dark brown for text
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              do {
                ctx.font = `600 ${fontSize}px sans-serif`;
                const m = ctx.measureText(label);
                if (m.width <= maxTextWidth || fontSize <= 18) break;
                fontSize -= 2;
              } while (fontSize > 18);

              const textX = OUT_W / 2;
              const textY = qrY + QR_SIDE + 40; // space below QR
              ctx.fillText(label, textX, textY);
            }

            // cleanup
            if (container.parentNode) container.parentNode.removeChild(container);
            const finalData = final.toDataURL("image/png");
            return resolve(finalData);
          } catch (err) {
            if (container.parentNode) container.parentNode.removeChild(container);
            return reject(err);
          }
        };
        qrImg.onerror = (e) => {
          if (container.parentNode) container.parentNode.removeChild(container);
          return reject(new Error("Failed to load QR image"));
        };
        qrImg.src = qrDataUrl;
      })();
    } catch (error) {
      return reject(error);
    }
  });
};

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
