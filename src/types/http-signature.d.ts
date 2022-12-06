/* eslint-disable @typescript-eslint/consistent-type-imports */
declare module "@peertube/http-signature" {
    type Parsed = Record<string, string>;
    type HttpSignature = {
        parseRequest: (req: import("next").NextApiRequest) => Parsed,
        verifySignature: (parsed: Parsed, public_key: string) => boolean,
    };
    const httpSignature: HttpSignature;
    export default httpSignature;
}
