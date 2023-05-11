export const config = {api: {bodyParser: {sizeLimit: '25mb'}}};

export default async function handler(req: any, res: any) {
    const {msgFileBase64, fileName} = req.body;
    const api: any = process.env.CONVERT_API_URL;

    const response = await fetch(api, {
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
            res.status(500).json({succes: false, message: err});
        });
}