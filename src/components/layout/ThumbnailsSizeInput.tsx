import { useSetAtom } from "jotai";
import { thumbnailsWidthAtom } from "../store/atoms";
import { useState } from "react";

export default function ThumbnailsSizeInput() {
    const setThumbnailsWidth: any = useSetAtom(thumbnailsWidthAtom);
    const [multiplier, setMultiplier] = useState(1.0);
    const handleChangeSize = (e: any) => {
        const defaultWidth: any = process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_WIDTH;
        const newMultiplier = parseFloat(e.target.value);
        const width: number = newMultiplier * defaultWidth;
        setThumbnailsWidth(width);
        setMultiplier(newMultiplier);
    }
    return <>
        <div className="w-full">
            <label htmlFor="thumbnailsSizeInput" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                Thumbnails grootte ({multiplier}x)
            </label>
            <input
                id="thumbnailsSizeInput"
                type="range"
                defaultValue={multiplier}
                onChange={handleChangeSize}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
        </div>
    </>
}