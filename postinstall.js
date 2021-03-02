/**
 * A simple script that comments out parts of node-dtls-client and the vm2 for node-wot Servient.
 * Needed to make sure building wade does not fail.
 */

fs = require("fs");
const PATH_AEAD = "./node_modules/node-dtls-client/build/lib/AEADCrypto.js" 
const PATH_SERVIENT = "./node_modules/@node-wot/core/dist/servient.js"
// Commenting out line in node-dtls-client
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

// Commenting out lines servient.js (concerning vm2)
try {
    lines = fs.readFileSync(PATH_SERVIENT).toString().split("\n");
    console.log("Read file " + PATH_SERVIENT + " successfully");
} catch (err) {
    console.error(err);
    return
}

if(!lines[2].startsWith("// ")) lines[2] = "// " + lines[2];
for(let i=14; i<68; i++){
    if(!lines[i].startsWith("// ")) lines[i] = "// " + lines[i];
}

text = lines.join("\n");


fs.writeFile(PATH_SERVIENT, text, function (err) {
    if (err) return console.log(err)
    else console.log("Written to file " + PATH_SERVIENT + " successfully");
});
