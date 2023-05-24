import { useEffect, useRef, useState } from "react"
import { BsCurrencyEuro } from "react-icons/bs"

export default function AdministrationTiles(props: any) {
    return <>
        <div {...props}>
            <div className={
                `bg-stone-100 w-full rounded-lg p-4 gap-2 sticky top-8 border border-stone-200 flex flex-wrap flex-row grid-flow-col auto-cols-fr`
            }>
                {administrationTiles.map((tile: any, index: number) =>
                    <div
                        className={
                            `text-sm min-w-[120px] inline-flex flex-1 flex-col h-[150px] rounded-lg overflow-hidden
                                bg-white border-stone-200 border p-4`
                        }
                        key={`administrationTile-${index}`}
                    >
                        <div className="bg-stone-100 p-4 rounded-lg inline-block mx-auto items-center justify-center mb-2 border border-stone-200">
                            <BsCurrencyEuro />
                        </div>

                        <span className="p-4">
                            <h3 className="text-sm font-bold">{tile.title}</h3>
                            <p className="text-xs">{tile.description}</p>
                        </span>
                    </div>
                )}
            </div>
        </div>
    </>
}

const administrationTiles = [
    {
        id: 0,
        code: 100,
        title: 'Administratie 1',
        description: 'Lorem ipsum.',
    },
    {
        id: 1,
        code: 101,
        title: 'Administratie 2',
        description: 'Lorem ipsum.',
    },
    {
        id: 2,
        code: 102,
        title: 'Administratie 3',
        description: 'Lorem ipsum.',
    },
    {
        id: 3,
        code: 103,
        title: 'Administratie 4',
        description: 'Lorem ipsum.',
    },
    {
        id: 4,
        code: 104,
        title: 'Administratie 5',
        description: 'Lorem ipsum.',
    },
]