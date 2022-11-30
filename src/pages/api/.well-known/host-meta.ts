import { type NextApiRequest, type NextApiResponse } from "next";

const hostMeta = async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('content-type', 'application/xrd+xml').send(
`<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
    <Link rel="lrdd" template="https://${req.headers.host}/.well-known/webfinger?resource={uri}"/>
</XRD>`
    );
}

export default hostMeta;
