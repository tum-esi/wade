import * as Req from "request";

function get_from_schema(el, prop) {
    let value
    if (el.interaction_type === "property-write" || el.interaction_type === "property-read") {
        value = el.object[prop]
    } else if (el.interaction_type === "event" && el.object.data) {
        value = el.object.data[prop]
    } else if (el.interaction_type === "action" && el.object.input) {
        value = el.object.input[prop]
    } else if (el.interaction_type === "action-read" && el.object.output) {
        value = el.object.output[prop]
    }
    return value
}

export function same_type(...elements) {
    let same = true
    let first_type

    elements.forEach(el => {
        let element_type = get_from_schema(el, "type")

        // number and integer should be treated the same way
        if (element_type === "integer") element_type = "number"

        if (!element_type) {
            same = false
            return // if no type info available, assume elements are not of same type
        }

        if (first_type) {
            if (element_type !== first_type) same = false
        } else {
            first_type = element_type
        }
    })

    return same
}

// TODO replace with custom/node word2vec
export function similar(element1, element2) {
    return new Promise((resolve, reject) => {
        Req(
            `http://127.0.0.1:5000/word2vec/similarity?w1=${element1.name}&w2==${element2.name}`, 
            (err, res, body) => {
                if (err) { 
                    console.log(err);
                } else if (res.statusCode === 200) {
                    if (body > threshold) resolve(true)
                    return
                } else {
                    console.log("Got HTTP response: " + res.statusCode)
                }
                resolve(false)
            }
        )
    })
}


export function same_semantics(element1, element2) {
    let typ1 = get_from_schema(element1, "@type")
    let typ2 = get_from_schema(element2, "@type")

    if (typ2 === undefined || typ1 === undefined) return false

    typ1 = typeof typ1 === "object" ? typ1[0].split(":")[0] : typ1.split(":")[0]
    typ2 = typeof typ2 === "object" ? typ2[0].split(":")[0] : typ2.split(":")[0]

    if (typ1 === typ2) return true
    else return false
}