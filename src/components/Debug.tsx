export default function Debug({
    pdfs,
    numberOfThumbnails,
    totalPages,
    current,
    userIsDragging,
    rows,
}) {
    const pdfsSize = pdfs?.length
        ? Buffer.from(JSON.stringify(pdfs)).length / 1000
        : 0

    return <pre>
        build: {process.env.NEXT_PUBLIC_BUILD_VERSION}
        <br />
        rows: {JSON.stringify(rows, 2, 2)}
        <br />
        pdfs.length: {JSON.stringify(pdfs?.length)}
        <br />
        numberOfThumbnails: {JSON.stringify(numberOfThumbnails.map(pdf => pdf?.length))}
        <br />
        totalPages: {JSON.stringify(totalPages)}
        <br />
        current: {JSON.stringify(current, 2, 2)}
        <br />
        userIsDragging: {JSON.stringify(userIsDragging)}
        <br />
        size: {pdfsSize} KB
    </pre>
}