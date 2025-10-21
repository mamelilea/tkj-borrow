import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1E293B',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const downloadQRCode = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateBorrowingCode = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PMJ-${year}-${random}`;
};

export const generateItemCode = (lastCode?: string): string => {
  if (!lastCode) return 'BRG-001';
  
  const match = lastCode.match(/BRG-(\d+)/);
  if (match) {
    const num = parseInt(match[1]) + 1;
    return `BRG-${num.toString().padStart(3, '0')}`;
  }
  
  return 'BRG-001';
};
