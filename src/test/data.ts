import type { IActor } from "lib/activities/type";

export const example_actor = {
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
        {
            "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
            "toot": "http://joinmastodon.org/ns#",
            "featured": {
                "@id": "toot:featured",
                "@type": "@id"
            },
            "featuredTags": {
                "@id": "toot:featuredTags",
                "@type": "@id"
            },
            "alsoKnownAs": {
                "@id": "as:alsoKnownAs",
                "@type": "@id"
            },
            "movedTo": {
                "@id": "as:movedTo",
                "@type": "@id"
            },
            "schema": "http://schema.org#",
            "PropertyValue": "schema:PropertyValue",
            "value": "schema:value",
            "discoverable": "toot:discoverable",
            "Device": "toot:Device",
            "Ed25519Signature": "toot:Ed25519Signature",
            "Ed25519Key": "toot:Ed25519Key",
            "Curve25519Key": "toot:Curve25519Key",
            "EncryptedMessage": "toot:EncryptedMessage",
            "publicKeyBase64": "toot:publicKeyBase64",
            "deviceId": "toot:deviceId",
            "claim": {
                "@type": "@id",
                "@id": "toot:claim"
            },
            "fingerprintKey": {
                "@type": "@id",
                "@id": "toot:fingerprintKey"
            },
            "identityKey": {
                "@type": "@id",
                "@id": "toot:identityKey"
            },
            "devices": {
                "@type": "@id",
                "@id": "toot:devices"
            },
            "messageFranking": "toot:messageFranking",
            "messageType": "toot:messageType",
            "cipherText": "toot:cipherText",
            "suspended": "toot:suspended",
            "focalPoint": {
                "@container": "@list",
                "@id": "toot:focalPoint"
            }
        }
    ],
    "id": "https://mastodon.social/users/Gargron",
    "type": "Person",
    "following": "https://mastodon.social/users/Gargron/following",
    "followers": "https://mastodon.social/users/Gargron/followers",
    "inbox": "https://mastodon.social/users/Gargron/inbox",
    "outbox": "https://mastodon.social/users/Gargron/outbox",
    "featured": "https://mastodon.social/users/Gargron/collections/featured",
    // "featuredTags": "https://mastodon.social/users/Gargron/collections/tags",
    "preferredUsername": "Gargron",
    "name": "Eugen Rochko",
    "summary": "<p>Founder, CEO and lead developer <span class=\"h-card\"><a href=\"https://mastodon.social/@Mastodon\" class=\"u-url mention\">@<span>Mastodon</span></a></span>, Germany.</p>",
    "url": "https://mastodon.social/@Gargron",
    "manuallyApprovesFollowers": false,
    "discoverable": true,
    "published": "2016-03-16T00:00:00Z",
    // "devices": "https://mastodon.social/users/Gargron/collections/devices",
    // "alsoKnownAs": [
    //     "https://tooting.ai/users/Gargron"
    // ],
    "publicKey": {
        "id": "https://mastodon.social/users/Gargron#main-key",
        "owner": "https://mastodon.social/users/Gargron",
        "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvXc4vkECU2/CeuSo1wtn\nFoim94Ne1jBMYxTZ9wm2YTdJq1oiZKif06I2fOqDzY/4q/S9uccrE9Bkajv1dnkO\nVm31QjWlhVpSKynVxEWjVBO5Ienue8gND0xvHIuXf87o61poqjEoepvsQFElA5ym\novljWGSA/jpj7ozygUZhCXtaS2W5AD5tnBQUpcO0lhItYPYTjnmzcc4y2NbJV8hz\n2s2G8qKv8fyimE23gY1XrPJg+cRF+g4PqFXujjlJ7MihD9oqtLGxbu7o1cifTn3x\nBfIdPythWu5b4cujNsB3m3awJjVmx+MHQ9SugkSIYXV0Ina77cTNS0M2PYiH1PFR\nTwIDAQAB\n-----END PUBLIC KEY-----\n"
    },
    "tag": [
  
    ],
    "attachment": [
        {
            "type": "PropertyValue",
            "name": "Patreon",
            "value": "<a href=\"https://www.patreon.com/mastodon\" target=\"_blank\" rel=\"nofollow noopener noreferrer me\"><span class=\"invisible\">https://www.</span><span class=\"\">patreon.com/mastodon</span><span class=\"invisible\"></span></a>"
        }
    ],
    "endpoints": {
        "sharedInbox": "https://mastodon.social/inbox"
    },
    "icon": {
        "type": "Image",
        "mediaType": "image/jpeg",
        "url": "https://files.mastodon.social/accounts/avatars/000/000/001/original/dc4286ceb8fab734.jpg"
    },
    "image": {
        "type": "Image",
        "mediaType": "image/jpeg",
        "url": "https://files.mastodon.social/accounts/headers/000/000/001/original/3b91c9965d00888b.jpeg"
    }
} satisfies IActor;