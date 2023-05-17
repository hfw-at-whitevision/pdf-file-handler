import Link from "next/link";

export default function ButtonXl({ href = "", title = "", description = "", style = "flat", icon = <>→</>, className = "", onClick = () => { }, children }: any, props: any) {
    return <>
        <Link
            className={
                `flex w-full flex-col gap-4 rounded-xl p-4 text-stone-600
                ${style === "flat" ? "bg-stone-100 hover:bg-white/20 shadow-xl" : "border-2 border-dotted border-amber/20 hover:border-amber/40"}"}
                ${className ? className : ''}`
            }
            href={href ? href : ''}
            onClick={onClick}
            {...props}
        >
            <h3 className="text-2xl font-bold flex items-center gap-2 justify-between">
                <span>{children ?? title}</span> {icon}
            </h3>
        </Link>
    </>
}