'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
}

export default function QRCodeView({ value, size = 160 }: QRCodeViewProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#2A1B6B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Error generating QR', err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="grid place-items-center bg-muted/40 rounded-xl text-xs text-muted-foreground animate-pulse"
      >
        Đang tạo QR…
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Mã QR vé điện tử"
      width={size}
      height={size}
      className="rounded-xl shadow-xs"
    />
  );
}
