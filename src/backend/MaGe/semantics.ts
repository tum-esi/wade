import * as N3 from 'n3';
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
import { RdfXmlParser } from "rdfxml-streaming-parser";
import { JsonLdParser } from "jsonld-streaming-parser";

export const parser = new N3.Parser();
export let vocabStore = new N3.Store();



export async function fetchAndStoreVocab(url:string): Promise<boolean> {
    let response: Response | null = null;
    let contentTypeString: string | null = null
    let requestInit : RequestInit = {
        method: "GET",
        headers: {
            "Accept": "text/turtle, application/rdf+xml;0.9, application/ld+json;0.9",
            "Origin": "localhost"
        }
    }
    try {
        response =  await fetch(`http://localhost:8082/${url}`, requestInit);
        console.log(response.headers.get("content-type"));
        contentTypeString = response.headers.get("content-type");  
    } catch (error) {
        console.log(error);
    }
   
   if(response && response.ok) {
        let rdfxmlParser = new RdfXmlParser({
            dataFactory: DataFactory,
        });
        let jsonLdParser = new JsonLdParser({
            dataFactory: DataFactory,
        });
        let text = await response.text();
        if(!contentTypeString) {
            if(text.search("xml") !== -1) {
                rdfxmlParser
                .on('data', (quad) => {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                })
                .on('error', console.error)
                .on('end', () => console.log('All triples were parsed!'));
            rdfxmlParser.write(text);
            rdfxmlParser.end();
            }
        } else if(contentTypeString && (contentTypeString.search("json") !== -1)) {
            jsonLdParser
                .on('data', (quad) => {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                })
                .on('error', console.error)
                .on('end', () => console.log('All JSON-LD triples were parsed!'));
            rdfxmlParser.write(text);
            rdfxmlParser.end();
        } else if(contentTypeString && (contentTypeString.search("xml") !== -1)) {
            rdfxmlParser
                .on('data', (quad) => {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                })
                .on('error', console.error)
                .on('end', () => console.log('All RDF/XML triples were parsed!'));
            rdfxmlParser.write(text);
            rdfxmlParser.end();
        } else if(contentTypeString && (contentTypeString.search("turtle") !== -1)) {
            parser.parse(text, (error, quad, prefixes) => {
                if(quad) {
                    quad.graph = namedNode(url);
                    vocabStore.addQuad(quad);
                }
            });
        } 
        return true;
   } else {
       return false
   }
}
