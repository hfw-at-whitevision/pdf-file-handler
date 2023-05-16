import React from "react";

export default function Button({
  title = '' as any,
  onClick = () => { },
  id = '',
  disabled = false,
  className = '',
  transparent = true,
}, props: any) {
  return (
    <div
      id={id}
      className={
        `flex flex-nowrap items-center justify-center p-8 gap-2
        ${transparent ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-600'}
        text-white font-bold py-2 px-4 rounded-md cursor-pointer 
         border-none ring-gray-400/30 hover:ring-gray-600/30
         ${disabled ? 'disabled' : ''} ${className}`
      }
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      {...props}
    >
      {title}
    </div>
  );
}
