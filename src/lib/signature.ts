import crypto from 'crypto';

type StringsRecord = Record<string, string>

export const parse = async (signature: string): Promise<StringsRecord> => {
    return {}
}

export const generateKeyPair = async () => {
  return await new Promise<{publicKey: string, privateKey: string}>((resolve, reject) => {
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
    }, (err, publicKey, privateKey) => { 
      if (err) {
        reject("invalid key params")
      }
      resolve({publicKey, privateKey})
    });
  });
}