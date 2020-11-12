const args = process.argv.slice(2)

import "./sdToSeqD"
import fs from  "fs";
import checkSD from "./validateSd"
import parseSeqD from "./parseSeqD"
import parseSD from "./parseSD"
import generateSeqD from "./generateSeqD"
import generateSD from "./generateSD"
import generateTS from "./codeGen"
import checkSeqD from "./validateSeqD"


const SDCHECK = true
// used expressions: TODO - important, OPT - improvement
// determine filePaths

let inFilesPath = args.shift()?.replace(/\\/g, "/") ?? "./example-input/SeqD-examples/SeqDs"
if (inFilesPath.endsWith("/")) {
    inFilesPath = inFilesPath.slice(0,-1)
}
const tdFilePath = args.shift() ?? "./example-input/SeqD-examples/TDs.json"
const outputPath = "./created-output" + inFilesPath.replace(/^[^]*example-input/, "").split("/").slice(0,-1).join("/") + "/"

// createFolders
fs.mkdirSync(outputPath + "SeqDs/", {recursive: true})
fs.mkdirSync(outputPath + "SDs/", {recursive: true})
fs.mkdirSync(outputPath + "Code/", {recursive: true})
if(!fs.existsSync(outputPath + "tsconfig.json")) {
    fs.copyFileSync("./definitions/tsconfig.json", outputPath + "tsconfig.json")
}

// ------------ Program -------------
fs.readdir(inFilesPath, (err, fileNames) => {
    if (err) {throw new Error("could not read input files")}
    fileNames.forEach( thisFileName => {
        const filePath = inFilesPath + "/" + thisFileName
        const fileType = thisFileName.split(".").pop()
        const outFileName = thisFileName.split(".").slice(0,-1).join(".")
        const inFile = fs.readFileSync(filePath, "utf8")
        let outFile: string
        let wholeOutPath: string
        let mashupLogic: SDSQ.mashupLogic | undefined

        let outCode: string
        let outBase: string
        let codeInput: string | undefined

        if (fileType === "json") {
            // convert SD to Sequence Diagram

            checkSD(inFile, SDCHECK).then( () => {

                const inSD: SDSQ.sdTemplate = JSON.parse(inFile)
                codeInput = inFile
                wholeOutPath = outputPath + "SeqDs/" + outFileName + ".puml"
                const outTDs: SDSQ.subthing[] = []
                Object.keys(inSD.things).forEach( name => {
                    outTDs.push(inSD.things[name])
                })

                try {
                    mashupLogic = parseSD(inSD)
                } catch (error) {
                    console.error({thisFileName})
                    throw new Error({thisFileName} + " parse SD problem!: " + error)
                }
                try {
                    if(mashupLogic) outFile = generateSeqD(mashupLogic)
                } catch (error) {
                    console.error({thisFileName})
                    throw new Error({thisFileName} + " generate SeqD problem!: " + error)
                }
                codeGen()

                fs.writeFile(wholeOutPath, outFile, "utf8", () => {
                    fs.writeFile(outputPath + "TDs.json", JSON.stringify(outTDs), () => {
                        console.log({thisFileName, "->": "conversion done!"})
                    })
                })
            }, e => {
               console.error({thisFileName}, "input SD invalid: " + e)
            })

        } else if (fileType === "puml") {
            // convert Sequence Diagram to SD
            checkSeqD(inFile).then( ok => {
                console.log({thisFileName},{ok})
                wholeOutPath = outputPath + "SDs/" + outFileName + ".json"

                const inTds = fs.readFileSync(tdFilePath, "utf8")
                try {
                    mashupLogic = parseSeqD(inFile)
                } catch (error) {
                    console.error({thisFileName})
                    throw new Error(thisFileName + " parseSeqD problem!: " + error)
                }

                try {
                    outFile = generateSD(mashupLogic, inTds)
                } catch (error) {
                    console.error({thisFileName})
                    throw new Error(thisFileName + " generateSD problem!: " + error)
                }

                codeInput = outFile

                checkSD(outFile, SDCHECK).then( () => {
                    fs.writeFile(wholeOutPath, outFile, "utf8", () => {
                        console.log({thisFileName, "->": "conversion done!"})
                    })
                }, e => {
                    fs.writeFile(wholeOutPath, outFile, "utf8", () => {
                        console.error({thisFileName}, "created output SD is invalid: " + e);
                    })
                })
                codeGen()
            }, notOk => {
                console.log({thisFileName}, notOk)
                throw new Error("!!! invalid Sequence Diagram notation" + notOk);
            })


        } else {
            throw new Error("unknown filetype as input at " + {thisFileName})
        }

        function codeGen() {
            // Code generation
            const codeOutPath = outputPath + "Code/" + outFileName
            if(!mashupLogic) {throw new Error("problem with mashup logic!")}
            if(!codeInput) {throw new Error("sd generation not working?")}
            try {
                const genResult = generateTS(JSON.parse(codeInput), mashupLogic, outFileName)
                outCode = genResult.code
                outBase = genResult.base
            } catch (error) {
                console.error({thisFileName})
                throw new Error(thisFileName + " codeGen problem!: " + error)
            }
            fs.writeFile((codeOutPath + "_index.js"), outBase, "utf8", () => {
                fs.writeFile((codeOutPath + ".ts"), outCode, "utf8", () => {
                    console.log({thisFileName, "->": "code generation done!"})
                })
            })
        }

    })
})