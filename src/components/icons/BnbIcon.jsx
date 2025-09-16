import React from 'react';

const BnbIcon = ({ size = 24, color = '#f3ba2f', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* BNB Logo - Diamond shape with inner diamond */}
      <path
        d="M12 2L16.5 6.5L12 11L7.5 6.5L12 2Z"
        fill={color}
      />
      <path
        d="M6 8L8.5 10.5L6 13L3.5 10.5L6 8Z"
        fill={color}
      />
      <path
        d="M18 8L20.5 10.5L18 13L15.5 10.5L18 8Z"
        fill={color}
      />
      <path
        d="M12 13L16.5 17.5L12 22L7.5 17.5L12 13Z"
        fill={color}
      />
      <path
        d="M12 9.5L14.5 12L12 14.5L9.5 12L12 9.5Z"
        fill={color}
      />
    </svg>
  );
};

export default BnbIcon;
