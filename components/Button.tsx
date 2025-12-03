import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: 'green' | 'orange' | 'blue' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

const colorStyles = {
  green: 'bg-green-500 hover:bg-green-400 border-green-700 text-white',
  orange: 'bg-orange-500 hover:bg-orange-400 border-orange-700 text-white',
  blue: 'bg-blue-500 hover:bg-blue-400 border-blue-700 text-white',
  red: 'bg-red-500 hover:bg-red-400 border-red-700 text-white',
  yellow: 'bg-yellow-400 hover:bg-yellow-300 border-yellow-600 text-amber-900'
};

const sizeStyles = {
  sm: 'px-4 py-2 text-lg',
  md: 'px-8 py-3 text-xl',
  lg: 'px-10 py-4 text-2xl'
};

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  color = 'green', 
  className = '', 
  size = 'md',
  ...rest
}) => {
  return (
    <button
      className={`
        ${colorStyles[color]} 
        ${sizeStyles[size]}
        border-b-4 active:border-b-0 active:translate-y-1
        rounded-full font-bold shadow-lg transition-all 
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        font-dynamic
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
};
