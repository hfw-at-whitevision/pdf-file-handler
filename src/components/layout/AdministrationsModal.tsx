import AdministrationTiles from "../AdministrationTiles";
import Button from "../primitives/Button";

export default function AdministrationsModal({
    pdfIndex,
    showAdministrationModal = false,
    setShowAdministrationModal,
    handleSaveDocument,
    filename = '',
}: any) {
    const handleSendToAdministration = async () => {
        const base64 = await handleSaveDocument(pdfIndex);
        alert(base64);
        setShowAdministrationModal(false);
    }
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
            <div className="bg-white p-8 rounded-lg w-[640px] z-[51] h-auto">
                <h3 className="font-bold mb-4">Stuur <span className="font-normal italic">"{filename}"</span> naar administratie:</h3>

                <AdministrationTiles
                    display='list'
                />

                <div className="mt-4 flex gap-4">
                    <Button
                        className="bg-brand-secondary rounded-lg text-white"
                        padding="large"
                        onClick={() => handleSendToAdministration()}
                    >
                        Verstuur naar administratie
                    </Button>
                    <Button
                        style="tertiary"
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