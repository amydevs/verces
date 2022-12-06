const message = {
    "@context":[
        "https://www.w3.org/ns/activitystreams",
        {
            "ostatus":"http://ostatus.org#",
            "atomUri":"ostatus:atomUri",
            "inReplyToAtomUri":"ostatus:inReplyToAtomUri",
            "conversation":"ostatus:conversation",
            "sensitive":"as:sensitive",
            "toot":"http://joinmastodon.org/ns#",
            "votersCount":"toot:votersCount"
        }
    ],
    "id":"https://tech.lgbt/users/amy727/statuses/109465279766693953#updates/1670313348",
    "type":"Update",
    "actor":"https://tech.lgbt/users/amy727",
    "published":"2022-12-06T07:55:48Z",
    "to":[
        "https://verces.vercel.app/users/1234"
    ],
    "cc":[
       
    ],
    "object":{
        "id":"https://tech.lgbt/users/amy727/statuses/109465279766693953",
        "type":"Note",
        "summary":null,
        "inReplyTo":null,
        "published":"2022-12-06T06:20:13Z",
        "url":"https://tech.lgbt/@amy727/109465279766693953",
        "attributedTo":"https://tech.lgbt/users/amy727",
        "to":[
            "https://verces.vercel.app/users/1234"
        ],
        "cc":[
          
        ],
        "sensitive":false,
        "atomUri":"https://tech.lgbt/users/amy727/statuses/109465279766693953",
        "inReplyToAtomUri":null,
        "conversation":"tag:tech.lgbt,2022-12-06:objectId=33210222:objectType=Conversation",
        "content":"<p><span class=\"h-card\"><a href=\"https://verces.vercel.app/@/1234\" class=\"u-url mention\">@<span>1234</span></a></span> test public key 5</p>",
        "contentMap":{
            "en":"<p><span class=\"h-card\"><a href=\"https://verces.vercel.app/@/1234\" class=\"u-url mention\">@<span>1234</span></a></span> test public key 5</p>"
        },
        "updated":"2022-12-06T07:55:48Z",
        "attachment":[
          
        ],
        "tag":[
            {
                "type":"Mention",
                "href":"https://verces.vercel.app/users/1234",
                "name":"@1234@verces.vercel.app"
            }
        ],
        "replies":{
            "id":"https://tech.lgbt/users/amy727/statuses/109465279766693953/replies",
            "type":"Collection",
            "first":{
                "type":"CollectionPage",
                "next":"https://tech.lgbt/users/amy727/statuses/109465279766693953/replies?only_other_accounts=true&page=true",
                "partOf":"https://tech.lgbt/users/amy727/statuses/109465279766693953/replies",
                "items":[
                
                ]
            }
        }
    }
};

import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";


const examples = async (req: NextApiRequest, res: NextApiResponse) => {
    const compacted = await compact(message);
    res.send(compacted);
};

export default examples;
