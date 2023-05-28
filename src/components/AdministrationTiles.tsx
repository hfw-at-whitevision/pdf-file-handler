import { BsCurrencyEuro } from "react-icons/bs"

export default function AdministrationTiles(props: any) {
    return <>
        <div {...props}>
            <div className={
                `bg-body-bg-dark w-full rounded-lg p-4 gap-4 sticky top-[132px] border border-text-lighter
                grid grid-cols-[repeat(auto-fill,_minmax(max(100px,_120px),_1fr))]`
            }>
                {administrationTiles.map((tile: any, index: number) =>
                    <div
                        className={
                            `w-full h-[150px]
                            text-sm flex-col rounded-md overflow-hidden
                            bg-body-bg-light border-text-lighter p-4`
                        }
                        key={`administrationTile-${index}`}
                    >
                        <div className="bg-body-bg p-4 rounded-md inline-block mx-auto items-center justify-center mb-2">
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