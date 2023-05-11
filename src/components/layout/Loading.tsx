export default function Loading({
    inset = false,
    loading = true,
    message = '',
}) {
    if (inset) {
        if (!loading) return null;
        return <>
            <div className="fixed z-50 inset-0 flex flex-col justify-center items-center bg-white/50">
                <img src="./loadingspinner.svg" width={150} className="flex justify-center gap-2 text-lg mb-4 w-12" />
                {message}
            </div>
        </>
    }
    else return <>
        <div className="p-8 w-full h-full flex justify-center items-center bg-white invert rounded-lg">
            <img src="./loadingspinner.svg" width={150} className="flex justify-center gap-2 text-lg mb-4 w-8" />
        </div>
    </>
}