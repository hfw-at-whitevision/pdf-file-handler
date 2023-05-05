export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

export default async function handler(req, res) {
    const { msgFileBase64, fileName } = req.body;

    const response = await fetch(process.env.CONVERT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            msgFileBase64,
            fileName
        })
    })
        .then(response => response.json())
        .then(response => res.status(200).json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json({ succes: false, message: err });
        });
}