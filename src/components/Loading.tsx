export default function Loading() {
    return <div className="p-32 w-full h-full flex justify-center items-center bg-white invert">
        <img src="./loadingspinner.svg" width={150} className="flex justify-center gap-2 text-lg mb-4 w-8" />
    </div>
}