import React from 'react';

export const Badge = ({ children, className = '', variant = 'default', ...props }: any) => (
  <span {...props} className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${className}`}>
    {children}
  </span>
);

export default Badge;
