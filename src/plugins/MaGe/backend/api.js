import * as CodeGen from "./code_gen.js";
import * as Utils from "./utils.js";
import {generate_mashups} from "./generator.js";


// Get list of existing TDs
export function getTDs() {
    return new Promise( (res, rej) => {
        Utils.update_tds();
        res({"inputs": Utils.tds_in, "outputs": Utils.tds_out, "ios": Utils.tds_io});
    });
}

// Get list of existing TDs
export function addTD(data) {
    return new Promise( (res, rej) => {
        try {
            Utils.save_td(data.td, data.classification);
            res();
        } catch (err) {
            rej(err);
        }
        
    })
}

// generate mashups
export function generateMashup(data){
    return new Promise( (res, rej) => {
        console.log("in generateMashup", data);
        generate_mashups(data)
        .then( (mashups) => {
            res(mashups);
        });
    });
}

// generate code
export function generateCode(data) {
    return new Promise( (res, rej) => {
        console.log({data});
        const code = CodeGen.generate_code(data.mashup, data.tds);
        res(code);
    });
}
