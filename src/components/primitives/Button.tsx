import React from "react";

export default function Button({
  title = '' as any,
  onClick,
  id = '',
  disabled = false,
  className = '',
  transparent = true,
  padding = 'normal',
  children = null,
  style = 'primary',
}: any, props: any) {
  let colors = '';
  switch (style) {
    case "primary":
      colors = 'bg-brand-secondary hover:bg-brand-secondary-light';
      break;
    case "secondary":
      colors = 'bg-amber-400 hover:bg-amber-500';
      break;
    case "tertiary":
      colors = 'bg-white hover:bg-body-bg-dark !text-text-dark';
      break;
    default:
      colors = 'bg-brand-secondary hover:bg-brand-secondary-light';
      break;
  }
  return (
    <button
      id={id}
      className={
        `flex flex-nowrap items-center justify-center p-8 gap-2
        rounded-md cursor-pointer 
        border-none ring-stone-400/30 hover:ring-stone-600/30 text-white
        ${colors}        
        ${padding === 'large' ? 'py-3 px-6'
          : padding === 'normal' ? 'py-2 px-4'
            : 'py-1 px-2'}
         
         ${disabled ? 'disabled' : ''} ${className}`
      }
      onClick={onClick}
      {...props}
    >
      {title}
      {children}
    </button>
  );
}
