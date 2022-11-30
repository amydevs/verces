import crypto from 'crypto';

export const generateKeyPair = async () => {
  return await new Promise<{pub: string, priv: string}>((resolve, reject) => {
    crypto.generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    }, (err, pub, priv) => { 
      if (err) {
        reject("invalid key params")
      }
      resolve({pub, priv})
    });
  });
}