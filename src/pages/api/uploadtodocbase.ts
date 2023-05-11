export const config = {api: {bodyParser: {sizeLimit: '25mb'}}};

export default async function handler(req: any, res: any) {
    const {pdfBase64, fileName, creationDate, pageCount} = req.body;
    const api: any = process.env.UPLOAD_API_URL
    fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pdfBase64,
            fileName,
            creationDate,
            pageCount,
        })
    })
        .then(response => response.json())
        .then(response => res.status(200).json(response))
        .catch(err => {
            console.log(err)
            res.status(500).json({
                success: false,
                message: err
            })
        })
}