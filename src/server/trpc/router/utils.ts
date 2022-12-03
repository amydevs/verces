import crypto from "crypto";

export const generateSecret = async () => {
    return await new Promise<string>((res, rej) => {
        crypto.randomBytes(64, function(err, buffer) {
            if (err) {
                rej(err);
            }
            res(buffer.toString("hex"));
        });
    });
};