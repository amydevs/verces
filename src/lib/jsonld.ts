import { activitystreams_url, CONTEXTS } from './contexts';
import * as jsonld from 'jsonld';


const nodeDocumentLoader = (jsonld as any).documentLoaders.node();
  // or grab the XHR one: jsonld.documentLoaders.xhr()
  
export const compact = async (doc: any) => {
    const context = {
        '@context': activitystreams_url
    }
    const documentLoader = async (url: string) => {
        if(url in CONTEXTS) {
          return {
            contextUrl: null, // this is for a context via a link header
            document: CONTEXTS[url], // this is the actual document that was loaded
            documentUrl: url // this is the actual context URL after redirects
          };
        }
        // call the default documentLoader
        return nodeDocumentLoader(url);
    };
    const compacted = await jsonld.compact(doc, context,{
        documentLoader
    })
    return compacted;
}
  