import React from "react";

export default function Button({
  title = '' as any,
  onClick,
  id = '',
  disabled = false,
  className = '',
  transparent = true,
  padding = 'normal',
}: any, props: any) {
  return (
    <div
      id={id}
      className={
        `flex flex-nowrap items-center justify-center p-8 gap-2
        ${transparent ? 'bg-brand-secondary hover:bg-brand-secondary-light' : 'bg-amber-400 hover:bg-amber-600'}
        text-white font-bold rounded-md cursor-pointer 
        ${padding === 'large' ? 'py-3 px-3'
          : padding === 'normal' ? 'py-2 px-4'
            : 'py-1 px-2'}
         border-none ring-stone-400/30 hover:ring-stone-600/30
         ${disabled ? 'disabled' : ''} ${className}`
      }
      onClick={onClick}
      {...props}
    >
      {title}
    </div>
  );
}
