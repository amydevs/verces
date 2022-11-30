import { NextApiRequest, NextApiResponse } from "next";

const webfinger = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.query)
    res.status(200).json({
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