import { NextApiRequest, NextApiResponse } from "next";

const webfinger = async (req: NextApiRequest, res: NextApiResponse) => {
    const reference = req.query.reference;
    if (typeof reference !== 'string') {
        return res.status(400).send('Bad Response')
    }
    return res.status(200).json({
        "subject": "acct:alice@my-example.com",
    
        "links": [
            {
                "rel": "self",
                "type": "application/activity+json",
                "href": `https://${req.headers.host}/actor`
            }
        ]
    });
};
  
export default webfinger;