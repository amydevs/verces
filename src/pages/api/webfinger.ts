import { NextApiRequest, NextApiResponse } from "next";

const webfinger = async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({
        "subject": "acct:alice@my-example.com",
    
        "links": [
            {
                "rel": "self",
                "type": "application/activity+json",
                "href": "https://my-example.com/actor"
            }
        ]
    });
};
  
export default webfinger;