import React from 'react';

export const Alert = ({ children, className = '', ...props }: any) => (
  <div {...props} className={`p-3 border rounded ${className}`}>
    {children}
  </div>
);

export const AlertDescription = ({ children, className = '', ...props }: any) => (
  <div {...props} className={`text-sm ${className}`}>
    {children}
  </div>
);

export default Alert;
