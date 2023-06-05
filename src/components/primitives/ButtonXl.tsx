export default function ButtonXl({ title = "", description = "", style = "flat", icon = <>→</>, className = "", onClick = () => { }, children }: any, props: any) {
    return <>
        <button
            className={
                `flex w-full flex-col gap-0 rounded-lg p-4 text-text-dark text-left justify-center
                ${style === "flat" ? "bg-body-bg-light hover:bg-body-bg-dark shadow-xl" : "border-2 border-dotted border-amber/20 hover:border-amber/40"}"}
                ${className ? className : ''}`
            }
            onClick={onClick}
            {...props}
        >
            <span className="text-lg font-bold flex items-center gap-2 justify-between w-full">
                {title
                    ? <h3>{title}</h3>
                    : null
                }
                <span>
                    {children}
                </span>

                {icon}
            </span>

            {description
                ? <span className="text-xs">{description}</span>
                : null
            }
        </button>
    </>
}