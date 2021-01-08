import Req from 'request'

function getFromSchema(el: MAGE.InteractionInterface, prop: string): string | string[] | object {
    let elObj = (el.object as any);
    let value;
    if (el.interactionType === "property-write" ||
        el.interactionType === "property-read") {
        value = el.object[prop]
    } else if (el.interactionType === "event-subscribe" && elObj.data) {
        value = elObj.data[prop]
    } else if (el.interactionType === "action-read" && elObj.input) {
        value = elObj.input[prop]
    } else if (el.interactionType === "action-invoke" && elObj.output) {
        value = elObj.output[prop]
    }
    return value
}

export function sameType(...elements: MAGE.InteractionInterface[]) {
    let same = true
    let firstType

    elements.forEach(el => {
        let elementType = getFromSchema(el, "type")

        // number and integer should be treated the same way
        if (elementType === "integer") elementType = "number"

        if (!elementType) {
            same = false
            return // if no type info available, assume elements are not of same type
        }

        if (firstType) {
            if (elementType !== firstType) same = false
        } else {
            firstType = elementType
        }
    })

    return same
}

export function similar(element1: MAGE.InteractionInterface, element2: MAGE.InteractionInterface, threshold: number) {
    return new Promise((resolve, reject) => {
        Req(
            `http://localhost:5000/word2vec/similarity?w1=${element1.name}&w2==${element2.name}`, 
            (err, res, body) => {
                if (err) { 
                    console.log(err);
                } else if (res.statusCode === 200) {
                    if (body > threshold) resolve(true);
                    return;
                } else {
                    console.log("Got HTTP response: " + res.statusCode);
                }
                resolve(false)
            }
        )
    })
}

export function similarDescription(description1: MAGE.InteractionInterface, description2: MAGE.InteractionInterface, threshold: number) {
    return new Promise((resolve, reject) => {
        Req(
            `http://localhost:5000/word2vec/wmd?s1=${description1}&s2==${description2}`, 
            (err, res, body) => {
                if (err) { 
                    console.log(err);
                } else if (res.statusCode === 200) {
                    console.log("Description Threshold: " + body);
                    if (body < threshold) resolve(true);
                    return;
                } else {
                    console.log("Got HTTP response: " + res.statusCode);
                }
                resolve(false);
            }
        )
    })
}


export function sameSemantics(element1, element2) {
    let typ1 = getFromSchema(element1, "@type")
    let typ2 = getFromSchema(element2, "@type")

    if (typ2 === undefined || typ1 === undefined) return false

    typ1 = typeof typ1 === "object" ? typ1[0].split(":")[0] : typ1.split(":")[0]
    typ2 = typeof typ2 === "object" ? typ2[0].split(":")[0] : typ2.split(":")[0]

    if (typ1 === typ2) return true
    else return false
}