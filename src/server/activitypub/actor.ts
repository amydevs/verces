export function createActor(name: string, domain: string, pubkey: string) {
    return {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1'
      ],
  
      'id': `https://${domain}/u/${name}`,
      'type': 'Person',
      'preferredUsername': `${name}`,
      'inbox': `https://${domain}/api/inbox`,
      'followers': `https://${domain}/u/${name}/followers`,
  
      'publicKey': {
        'id': `https://${domain}/u/${name}#main-key`,
        'owner': `https://${domain}/u/${name}`,
        'publicKeyPem': pubkey
      }
    };
}