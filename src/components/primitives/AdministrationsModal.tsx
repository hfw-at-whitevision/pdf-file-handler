import AdministrationTiles from "../AdministrationTiles";
import Button from "./Button";

export default function AdministrationsModal({
    showAdministrationModal = false,
    setShowAdministrationModal,
    filename = '',
}: any) {
    return <>
        {/* backdrop */}
        <div
            className={
                `fixed z-50 bg-black/25 flex items-center justify-center inset-0
            ${showAdministrationModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}>

            {/* onClick = close inset */}
            <div className="absolute inset-0" onClick={() => setShowAdministrationModal(false)} />

            {/* modal */}
            <div className="bg-white p-8 rounded-lg w-[640px] z-[51]">
                <h3 className="font-bold mb-4">Stuur <span className="font-normal italic">"{filename}"</span> naar administratie:</h3>

                <AdministrationTiles
                    display='list'
                />

                <div className="mt-4 flex gap-4">
                    <Button
                        className="bg-brand-secondary rounded-lg text-white"
                        padding="large"
                    >
                        Verstuur naar administratie
                    </Button>
                    <Button
                        style="secondary"
                        className="rounded-lg p-4"
                        onClick={() => setShowAdministrationModal(false)}
                        padding="large"
                    >
                        Annuleer
                    </Button>
                </div>
            </div>

        </div>
    </>
}