/**
 * A simple script that comments out parts of node-dtls-client.
 * Needed to make sure building wade does not fail.
 */

fs = require("fs");
const PATH_AEAD = "./node_modules/node-dtls-client/build/lib/AEADCrypto.js"

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
