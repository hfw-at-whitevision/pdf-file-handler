export default function Debug({
    pdfs,
    numberOfThumbnails,
    totalPages,
    current,
}) {
    const pdfsSize = pdfs?.length
        ? Buffer.from(JSON.stringify(pdfs)).length / 1000
        : 0

    return <pre>
        build: 0.1.1
        <br />
        pdfs.length: {JSON.stringify(pdfs?.length)}
        <br />
        numberOfThumbnails: {JSON.stringify(numberOfThumbnails.map(pdf => pdf?.length))}
        <br />
        totalPages: {JSON.stringify(totalPages)}
        <br />
        current: {JSON.stringify(current, 2, 2)}
        <br />
        size: {pdfsSize} KB
    </pre>
}