import * as path from 'path';
import * as fs from 'fs';
import * as WoT from 'wot-typescript-definitions';
import * as os from 'os';
// import { readFile , readFileSync } from "fs";
// import { join } from "path";

export default class VtCall {
    public debug: string;

    private givenTD: string|null;
    private givenVtConfig: string;
    private usedTempFolder: string|null;
    private createTempTimeout: NodeJS.Timeout;
    private givenTdId: string;

    constructor(givenTD: WoT.ThingDescription | null, givenVtConfig: string, givenTdId: string) {
        this.givenTD = givenTD;
        this.givenVtConfig = givenVtConfig;
        this.debug = '';
        this.usedTempFolder = null;
        this.givenTdId = givenTdId;

        fs.mkdtemp(path.join(os.tmpdir(), 'virtualthing-'), (err, genfolder) => {
            if (err) {
                this.debug += 'problem with gen-temp-folder' + err ;
            } else {
                this.usedTempFolder = genfolder;
            }
            // console.log(folder);
            // Prints: /tmp/foo-itXde2 or C:\Users\...\AppData\Local\Temp\foo-itXde2
        });

        this.createTempTimeout = setTimeout(() => {
            throw new Error('creating temp folder takes to long!');
        }, 2000);

        while ( this.usedTempFolder === null ) {
            // do nothing to await tmp-folder being created or error being thrown
        }
        clearTimeout(this.createTempTimeout);

        this.writeTD()
        .then( () => {this.writeVtConfig(); }, () => {this.debug += '<problem with writeTD> '; })
        .then( () => {this.startVt(); }, () => {this.debug += '<problem with writeVtConfig> '; })
        .then( null, () => {this.debug += 'problem at startVt'; });

    }

    private writeTD() {
        return new Promise( (resolve, reject) => {
            if ( this.givenTD === null) {
                fs.copyFileSync(
                    path.join(
                        __dirname, 'node_modules', 'virtual-thing', 'examples', 'td', 'coffee_machine_td.json'
                    ),
                    path.join(
                        this.usedTempFolder as string, 'coffee_machine_td.json'
                    )
                );
                resolve();
            } else {
                fs.writeFileSync(path.join( this.usedTempFolder as string, this.givenTdId ), this.givenTD);
                resolve();
            }
        });
    }
    private writeVtConfig() {
        return new Promise( (resolve, reject) => {
            // write config to the temp folder
            reject();
        });
    }
    private startVt() {
        return new Promise( (resolve, reject) => {
            // start virtual thing with the path to the tmp folder
            reject();
        });
    }
}
