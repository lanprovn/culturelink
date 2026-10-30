'use client';

import React from 'react';

interface ZaloIconProps {
  className?: string;
  size?: number;
}

export default function ZaloIcon({ className = 'h-4 w-4', size = 20 }: ZaloIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="22" fill="#0068FF" />
      <path
        d="M14 31V17H21.5L16.2 26H21.5V31H14Z"
        fill="white"
      />
      <path
        d="M26.8 31L26.3 28.5H23.7L23.2 31H21L23.7 17H26.3L29 31H26.8ZM25 22.2L24.1 26.6H25.9L25 22.2Z"
        fill="white"
      />
      <path
        d="M30.5 31V17H32.8V29H36.5V31H30.5Z"
        fill="white"
      />
    </svg>
  );
}

