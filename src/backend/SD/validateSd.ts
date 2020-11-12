import Ajv from "ajv";
import fs from "fs";
import https from "https";

const ajv = new Ajv({ loadSchema })

// load SD Schema
const schemaFilePath = "./definitions/sdSchema.json"
const schema = JSON.parse(fs.readFileSync(schemaFilePath, "utf8"))

// TODO: throw new Error for invalid SD
export default function checkSD(sdFileContent: string, checkRequired = true) {
    return new Promise( (res, rej) => {
        if (checkRequired === false) {
            res()
        } else {
            const SD = JSON.parse(sdFileContent)
            let valid
            ajv.compileAsync(schema).then( validation => {
                                        valid = validation(SD)
                                        if (valid) {res()}
                                        else {rej('!!!???!!! SD Invalid: ' + ajv.errorsText(validation.errors))}
                                    })
        }
    })
}


function loadSchema(uri) {
    return new Promise<object>( (resolve, reject) => {
        https.get(uri, res => {
            if (res.statusCode === undefined) {throw new Error("https status Code undefined")}
            if (res.statusCode >= 400) {
                reject('Loading error: ' + res.statusCode)
            }
            res.setEncoding("utf8")
            let body = ""
            res.on("data", data => {
            body += data
            })
            res.on("end", () => {
                resolve(JSON.parse(body))
            })
        })
    })
}