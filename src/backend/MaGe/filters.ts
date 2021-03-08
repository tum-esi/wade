import Req from 'request';

/** Gets a property from an interaction data schema
 * 
 * @param {MAGE.InteractionInterface} el an interaction 
 * @param {string} prop the name of the property 
 * @returns the property if found, else `undefined`
 */
function getFromSchema(el: MAGE.InteractionInterface, prop: string): string | string[] | object | undefined {
    const elObj = (el.object as any);
    let value: string | object | string[] | undefined;
    if (el.interactionType === 'property-write' ||
        el.interactionType === 'property-read') {
        value = el.object[prop];
    } else if (el.interactionType === 'event-subscribe' && elObj.data) {
        value = elObj.data[prop];
    } else if (el.interactionType === 'action-read' && elObj.input) {
        value = elObj.input[prop];
    } else if (el.interactionType === 'action-invoke' && elObj.output) {
        value = elObj.output[prop];
    }
    return value;
}

/** Checks if a set of interactions have the same type of data schema
 * 
 * @param {MAGE.InteractionInterface[]} elements an array of interactions
 * @returns {boolean} return `true` if data schemas are of the same type, else return `false`
 */
export function sameType(...elements: MAGE.InteractionInterface[]): boolean {
    let same = true;
    let firstType: string | object;

    elements.forEach(el => {
        let elementType = getFromSchema(el, 'type');
        // number and integer should be treated the same way
        if (elementType === 'integer') elementType = 'number';
        if (!elementType) {
            same = false;
            return; // if no type info available, assume elements are not of same type
        }
        if (firstType) {
            if (elementType !== firstType) same = false;
        } else {
            firstType = elementType;
        }
    });

    return same;
}

/** Checks if two interaction have similar names. This is done using an NLP server.
 * Throws an error if it cannot connect to the server or if the response status code is not 200
 * 
 * @param {string} name1 an interaction
 * @param {string} name2 an interaction 
 * @param {number} threshold a number that is between 0 and 1
 * @returns {Promise<boolean>} return a Promise that evaluates to `true` the similarity is higher than `threshold`, else evaluates to `false`
 */
export function similar(name1: string, name2: string, threshold: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if(!name1 || !name2) return false;
        Req(
            `http://localhost:5000/word2vec/similarity?w1=${name1}&w2==${name2}`,
            (err, res, body) => {
                if (res.statusCode === 200) {
                    if (body > threshold) resolve(true); else resolve(false);
                    return;
                }
                else if (err) {
                    reject(err);
                } else {
                    reject('Got HTTP response: ' + res.statusCode);
                }
            }
        );
    });
}

/** Checks if two interaction have similar descriptions. This is done using an NLP server.
 * Throws an error if it cannot connect to the server or if the response status code is not 200
 * 
 * @param {string} description1 the description of the first interaction
 * @param {string} description2 the description of the second interaction
 * @param {string} threshold a number
 * @returns {Promise<boolean>} return a Promise that evaluates to `true` the similarity is lower than `threshold`, else evaluates to `false`
 */
export function similarDescription(description1: string, description2: string, threshold: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if(!description1 || !description2) return false;
        Req(
            `http://localhost:5000/word2vec/wmd?s1=${description1}&s2==${description2}`,
            (err, res, body) => {
                if (res.statusCode === 200) {
                    if (body < threshold) resolve(true); else resolve(false);
                    console.log('Description Threshold: ' + body);
                    return;
                }
                else if (err) {
                    reject(err);
                } else {
                    reject('Got HTTP response: ' + res.statusCode);
                }
            }
        );
        
    });
}

/** Checks if two interactions are annotated using a semantic annotation from the same semantic context
 * 
 * @param element1 an interaction
 * @param element2 an interaction
 * @returns {boolean} returns `true` if both interaction are annotated using a semantic annotation from the same semantic context, else returns `false` 
 */
export function sameSemantics(element1: MAGE.InteractionInterface, element2: MAGE.InteractionInterface): boolean{
    let typ1: string | string[] = element1.object['@type'];
    let typ2: string | string[] = element2.object['@type'];

    if (typ2 === undefined || typ1 === undefined) return false;
    if(typeof typ1 === 'string') typ1 = [typ1]
    if(typeof typ2 === 'string') typ2 = [typ2]
    
    for(let t1 of typ1){
        let context1 = t1.split(':')[0];
        for(let t2 of typ2) {
            let context2 = t2.split(':')[0];
            if(context1 === context2) return true;
        }
    }
    return false;
}
