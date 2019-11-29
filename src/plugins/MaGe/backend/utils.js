import * as fs from "fs";
import * as path from "path";
// ------------------ HANDLING TDs ------------------

const INPUT_FOLDER = "C:/Users/adria/Documents/2_MA-Docs/1_WADE/3_TUM-ESI-wade/src/plugins/MaGe/backend/tds/input/";
const OUTPUT_FOLDER = "C:/Users/adria/Documents/2_MA-Docs/1_WADE/3_TUM-ESI-wade/src/plugins/MaGe/backend/tds/output/";
const IO_FOLDER = "C:/Users/adria/Documents/2_MA-Docs/1_WADE/3_TUM-ESI-wade/src/plugins/MaGe/backend/tds/io/";
// TODO change to relative path
export function get_tds(folder) {
    let tds = [];
    let filenames = fs.readdirSync(folder);
    filenames.forEach( filename => {
        let content = fs.readFileSync(folder + filename, 'utf-8');
        tds.push(JSON.parse(content));
    })
    return tds;
}

export let tds_io;
export let tds_in;
export let tds_out;

export function update_tds() {
    tds_io = get_tds(path.join(/*__dirname,*/ IO_FOLDER));
    tds_in = get_tds(path.join(/*__dirname,*/ INPUT_FOLDER));
    tds_out = get_tds(path.join(/*__dirname,*/ OUTPUT_FOLDER));
}



export function save_td(td, classification) {
    let td_path = "";
    if (!td.title) {
        throw Error("No valid 'title' in TD");
    }
    switch (classification) {
        case "input":
            td_path = path.join(__dirname, INPUT_FOLDER, td.title + ".json");
            break;
        case "output":
            td_path = path.join(__dirname, OUTPUT_FOLDER, td.title + ".json");
            break;
        case "io":
            td_path = path.join(__dirname, IO_FOLDER, td.title + ".json");
            break;
        default:
            throw Error(`TD not saved due to invalid classification: ${classification}`);
    }
    fs.writeFileSync(td_path, JSON.stringify(td));
}

update_tds();
// module.exports.update_tds = update_tds;
// module.exports.save_td = save_td;

// ------------------ MATH & STATISTICS ------------------

// calculates the cartesian product from two array
let f = (a, b) => [].concat(...a.map(a => b.map(b => [].concat(a, b))));
let cartesian = (a, b, ...c) => b ? cartesian(f(a, b), ...c) : a;

// remove duplicates mashups from cartesian product
let no_duplicates_cartesian = (...params) => {
    let cartesian_product = cartesian(...params);

    let hashes = [];
    let new_array = [];

    cartesian_product.forEach(element => {

        // make sure that combination doesnt contain same output twice
        let ids = [];
        let new_element = [];
        element.forEach(o => { 
            if (!ids.includes(o.id)) {
                ids.push(o.id);
                new_element.push(o);
            }
        });

        // make sure that combination doesnt get added twice in different orders
        let element_hash = "";
        new_element.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)); 
        new_element.forEach(e => element_hash+=e.id);

        if (!hashes.includes(element_hash)) {
            new_array.push(new_element);
            hashes.push(element_hash);
        }
    });

    return new_array;
}

export let factorial = (num) => {
    let return_val = 1;
    for (let i = 2; i <= num; i++)
        return_val *= i;
    return return_val;
}

export let modified_cartesian_product = no_duplicates_cartesian;
