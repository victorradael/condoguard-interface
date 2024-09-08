// components/Button.tsx
'use client';

import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, onClick }) => {
  const baseStyle = "px-4 py-2 rounded text-white ";
  const styles = variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600';
  return (
    <button onClick={onClick} className={`${baseStyle} ${styles}`}>
      {children}
    </button>
  );
};

export default Button;
