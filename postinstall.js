/**
 * A simple script that comments out parts of node-dtls-client and json-placeholder-replacer.
 * Needed to make sure building wade does not fail.
 */

fs = require("fs");
const PATH_AEAD = "./node_modules/node-dtls-client/build/lib/AEADCrypto.js"
const PATH_REPLACER = "./node_modules/json-placeholder-replacer/dist/index.js"

// Commenting out lines in node-dtls-client
let lines = [""];
try {
    lines = fs.readFileSync(PATH_AEAD).toString().split("\n");
    console.log("Read file " + PATH_AEAD + " successfully");
} catch (err) {
    console.error(err);
    return
}

for(let i=51; i<55; i++){
    if(!lines[i].startsWith("// ")) lines[i] = "// " + lines[i];
}

let text = lines.join("\n");


fs.writeFile(PATH_AEAD, text, function (err) {
    if (err) return console.log(err)
    else console.log("Written to file " + PATH_AEAD + " successfully");
});

// Removing shebang in json-placeholder-replacer (otherwise wade won't build)
try {
    lines = fs.readFileSync(PATH_REPLACER).toString().split("\n");
    console.log("Read file " + PATH_REPLACER + " successfully");
} catch (err) {
    console.error(err);
    return
}

if(lines[0].startsWith("#!")) lines.shift();
text = lines.join("\n");


fs.writeFile(PATH_REPLACER, text, function (err) {
    if (err) return console.log(err)
    else console.log("Written to file " + PATH_REPLACER + " successfully");
});
