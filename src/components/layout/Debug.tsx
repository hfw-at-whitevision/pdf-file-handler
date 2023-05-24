export default function Debug(props: any) {
    const pdfsSize = props?.pdfs?.length
        ? Buffer.from(JSON.stringify(props?.pdfs)).length / 1000
        : 0
    const data = Object.keys(props)?.map((propKey, i) => (<>
        {propKey}: {JSON.stringify(Object.values(props)?.[i])}
        <br />
    </>))
    return <pre>
        build: {process.env.NEXT_PUBLIC_BUILD_VERSION}
        <br />
        {data}
        size: {pdfsSize} KB
    </pre>
}