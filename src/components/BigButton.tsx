import React from "react";

export function BigButton({
  title = '' as any,
  onClick = () => { },
  id = '',
  disabled = false,
  className = '',
  transparent = true,
}) {
  return (
    <div
      id={id}
      className={
        `flex flex-nowrap items-center justify-center p-8 gap-2
        ${transparent ? 'bg-purple-400/30 hover:bg-purple-600/30' : 'bg-purple-400 hover:bg-purple-600'}
        text-white font-bold py-2 px-4 rounded-md cursor-pointer 
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
