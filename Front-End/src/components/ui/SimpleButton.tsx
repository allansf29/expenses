// src/ui/SimpleButton.tsx
import React from "react";

const SimpleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...props
}) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer ${className}`}
  >
    {children}
  </button>
);

export default SimpleButton;