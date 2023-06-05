import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { pdfsAtom } from "../store/atoms";

export default function Debug(props: any) {
    const router = useRouter();
    let { debug }: any = router.query;
    if (!debug) return null;
    const pdfs = useAtom(pdfsAtom);

    const pdfsSize = pdfs?.length
        ? Buffer.from(JSON.stringify(pdfs[0]))?.length / 1024
        : 0
    const data = Object.keys(props)?.map((propKey, i) => (<span key={`debug-${i}`}>
        {propKey}: {JSON.stringify(Object.values(props)?.[i])}
        <br />
    </span>))

    return <pre className="z-[1000] fixed right-0 bottom-0 bg-brand-primary/10 backdrop-blur-lg max-w-[800px]">
        build: {process.env.NEXT_PUBLIC_BUILD_VERSION}
        <br />
        {data}
        size: {pdfsSize} KB
    </pre>
}