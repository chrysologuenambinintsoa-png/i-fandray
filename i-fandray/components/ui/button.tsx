import React from 'react';

export const Button = ({ children, className = '', ...props }: any) => {
  return (
    <button {...props} className={`inline-flex items-center justify-center ${className}`}>
      {children}
    </button>
  );
};

export default Button;
