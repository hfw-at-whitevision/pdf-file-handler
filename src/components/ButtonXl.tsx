import Link from "next/link";

export default function ButtonXl({ href = "", title = "Go", description = "", style = "flat", icon = <>→</>, className = "", onClick = () => { } }, props: any) {
    return <>
        <Link
            className={
                `flex w-full flex-col gap-4 rounded-xl p-4 text-white
                ${style === "flat" ? "bg-white/10  hover:bg-white/20 shadow-xl" : "border-2 border-dotted border-white/20 hover:border-white/40"}"}
                ${className ? className : ''}`
            }
            href={href ? href : ''}
            onClick={onClick}
            {...props}
        >
            <h3 className="text-2xl font-bold flex items-center gap-2 justify-between"><span>{title}</span> {icon}</h3>
            <div className="text-sm">
                {description}
            </div>
        </Link>
    </>
}