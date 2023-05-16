import { useEffect, useRef, useState } from "react"
import { BsCurrencyEuro } from "react-icons/bs"

export default function AdministrationTiles(props) {
    const ref = useRef(null);
    const [width, setWidth]: any = useState();
    useEffect(() => {
        setWidth(ref?.current?.getBoundingClientRect()?.width);
    }, [props])

    return <>
        <div ref={ref} style={{
            width: Math.round(width),
        }} {...props}>
            <div
                className={
                    `bg-gray-100 w-full rounded-lg p-4 grid gap-2 shadow-md sticky top-8
                    ${width > 500 ? 'grid-cols-3' : width > 350 ? 'grid-cols-2' : 'grid-cols-1'}`
                }
            >
                {
                    administrationTiles.map((tile: any, index: number) => <>
                        <div
                            className={
                                `block text-sm min-h-[150px] rounded-lg overflow-hidden
                                bg-white border-gray-200 border aspect-w-1 aspect-h-1
                                `
                            }
                            key={`administrationTile-${index}`}
                        >
                            <span className="p-4">
                                <div className="bg-gray-100 p-4 rounded-lg inline-block mx-auto items-center justify-center mb-2 border border-gray-200">
                                    <BsCurrencyEuro />
                                </div>
                                <h3 className="text-sm font-bold">{tile.title}</h3>
                                <p className="text-xs">{tile.description}</p>
                            </span>
                        </div>
                    </>)
                }
            </div>
        </div>
    </>
}

const administrationTiles = [
    {
        id: 0,
        code: 100,
        title: 'Administratie 1',
        description: 'Lorem ipsum dolor sit amet.',
    },
    {
        id: 1,
        code: 101,
        title: 'Administratie 2',
        description: 'Lorem ipsum dolor sit amet.',
    },
    {
        id: 2,
        code: 102,
        title: 'Administratie 3',
        description: 'Lorem ipsum dolor sit amet.',
    },
    {
        id: 3,
        code: 103,
        title: 'Administratie 4',
        description: 'Lorem ipsum dolor sit amet.',
    },
    {
        id: 4,
        code: 104,
        title: 'Administratie 5',
        description: 'Lorem ipsum dolor sit amet.',
    },
]