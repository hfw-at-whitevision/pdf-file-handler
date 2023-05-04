export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

export default async function handler(req, res) {
    const { pdfBase64, fileName, creationDate, pageCount } = req.body;

    fetch(process.env.UPLOAD_API_URL, {
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