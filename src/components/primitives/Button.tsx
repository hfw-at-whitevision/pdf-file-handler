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
        ${transparent ? 'bg-stone-700 hover:bg-stone-700' : 'bg-amber-400 hover:bg-amber-600'}
        text-white font-medium py-2 px-4 rounded-md cursor-pointer 
         border-none ring-stone-400/30 hover:ring-stone-600/30
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
