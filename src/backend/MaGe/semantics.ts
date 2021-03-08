import * as N3 from 'n3';
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
import { RdfXmlParser } from 'rdfxml-streaming-parser';
import { JsonLdParser } from 'jsonld-streaming-parser';

export const parser = new N3.Parser();
export let vocabStore = new N3.Store();


/** A function that fetches a semantic vocabulary and stores it in an N3 graph
 * 
 * @param {string} url the url of the vocabulary
 * @returns {Promise<boolean>}
 */
export async function fetchAndStoreVocab(url: string): Promise<boolean> {
    let response: Response | null = null;
    let contentTypeString: string | null = null;
    const requestInit: RequestInit = {
        method: 'GET',
        headers: {
            Accept: 'text/turtle, application/rdf+xml;0.9, application/ld+json;0.9',
            Origin: 'localhost'
        }
    };
    try {
        response =  await fetch(url, requestInit);
        contentTypeString = response.headers.get('content-type');
    } catch (error) {
        return error;
    }

   if (response && response.ok) {
        const rdfXmlParser = new RdfXmlParser({
            dataFactory: DataFactory,
        });
        const jsonLdParser = new JsonLdParser({
            dataFactory: DataFactory,
        });
        const text = await response.text();
        if (!contentTypeString) {
            if (text.search('xml') !== -1) {
                rdfXmlParser
                .on('data', (quad) => {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                });
            rdfXmlParser.write(text);
            rdfXmlParser.end();
            }
        } else if (contentTypeString && (contentTypeString.search('json') !== -1)) {
            jsonLdParser
                .on('data', (quad) => {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                });
            rdfXmlParser.write(text);
            rdfXmlParser.end();
        } else if (contentTypeString && (contentTypeString.search('xml') !== -1)) {
            rdfXmlParser
                .on('data', (quad) => {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                });
            rdfXmlParser.write(text);
            rdfXmlParser.end();
        } else if (contentTypeString && (contentTypeString.search('turtle') !== -1)) {
            parser.parse(text, (error, quad, prefixes) => {
                if (quad) {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                }
            });
        }
        return true;
   } else {
       return false;
   }
}
