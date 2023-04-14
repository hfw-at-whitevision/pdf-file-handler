import React from "react";

export function BigButton({
  title = '' as any,
  onClick = () => { },
  id = '',
  disabled = false,
  className = '',
}) {
  return (
    <div
      id={id}
      className={
        `inline-flex items-center justify-center p-8 gap-2
        bg-purple-400/30 hover:bg-purple-600/30 text-white font-bold py-2 px-4 rounded-md cursor-pointer 
         border-none ring-purple-400/30 hover:ring-purple-600/30
         ${disabled ? 'disabled' : ''} ${className}`
      }
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
    >
      {title}
    </div>
  );
}
