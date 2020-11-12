import fs from "fs";
import checkSD from "./validateSd"

// TODO add SD context (in @context) upon its publication

// edit SD content directly below to benefit from intelli-sense
let newSD: SDSQ.sdTemplate = {
    "@context": [
      "https://www.w3.org/2019/wot/td/v1",
      {
        "@language": "en"
      }
    ],
    "id": "de:tum:ei:esi:MashDE:",
    "@type": "Thing",
    "title": "MashupTitle",
    "description": "a mashup generated with MashDE",
    "securityDefinitions": {
      "nosec_sc": {
        "scheme": "nosec"
      }
    },
    "security": "nosec_sc",
    "things": {},
    "variables": {},
    "properties": {},
    "actions": {},
    "functions": {},
    "events": {},
    "path": [{"wait": 300}]
}

// store to file
fs.writeFileSync("./created-output/manualSD.json", JSON.stringify(newSD, undefined, 4))

// validate if SD is correct
checkSD(JSON.stringify(newSD)).then( () => {
    console.log({"SD-is-valid":":)"})
}, (err) => {
    console.log({"SD-invalid!":err})
})