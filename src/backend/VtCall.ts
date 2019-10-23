import * as path from 'path';
import * as fs from 'fs';
import * as WoT from 'wot-typescript-definitions';
import * as os from 'os';
import * as child_process from 'child_process';
import * as stream from 'stream';
import { VtStatus, ProtocolEnum } from '@/util/enums';
import { loggingError } from '@/util/helpers';
// import { readFile , readFileSync } from "fs";
// import { join } from "path";

export default class VtCall {
    public link: string;
    public copyLinks: string[];
    public status: VtStatus;

    private givenTD: string;
    private givenVtConfig: string;
    private usedTempFolder: string|null;
   /* private givenTdId: string;*/
    private VtProcess: child_process.ChildProcess | null;
    private writeOutTo: stream.Writable;
    private writeErrorTo: stream.Writable;

    constructor(
            givenVtConfig: string,
            writeOutTo: stream.Writable,
            writeErrorTo: stream.Writable,
            givenTD: WoT.ThingDescription,
        ) {
        this.givenVtConfig = givenVtConfig;
        this.link = '';
        this.copyLinks = [];
        this.usedTempFolder = null;
        this.VtProcess = null;
        this.writeOutTo = writeOutTo;
        this.writeErrorTo = writeErrorTo;
        this.status = VtStatus.STARTUP;
        this.givenTD = givenTD;
    }

    public launchVt() {
        return new Promise( (res, rej) => {
            this.status = VtStatus.STARTUP;
            this.initTmpFolder()
            .then( () => {
                this.writeTD();
            }, (err) => {
                rej(err);
            })
            .then( () => {
                this.writeVtConfig();
                }, (err) => {
                rej(err);
            })
            .then( () => {
                this.startVt();
            }, (err) => {
                rej(err);
            })
            .then( () => {
                this.linkVt();
            }, (err) => {
                rej(err);
            })
            .then( () => {
                this.status = VtStatus.RUNNING;
                res();
            }, (err) => {
                loggingError(new Error('creating a link for Vt in launch Vt was not possible: ' + err));
                /* Virtual Thing should be started even if Link generation failed*/
                this.status = VtStatus.RUNNING;
                res();
            });
        });
    }

    public stopVt() {
        return new Promise( (res, rej) => {
            if (this.VtProcess !== null) {
                this.VtProcess.kill();

                // delete vt config, td and the tmp directory
                if (this.usedTempFolder !== null) {
                    try {
                        fs.unlinkSync(path.join(this.usedTempFolder, 'vt-td.json'));
                    } catch (err) {
                        loggingError('cannot del virtual thing td in temp' + err);
                    }
                    try {
                        fs.unlinkSync(path.join(this.usedTempFolder as string, 'vt-config.json'));
                    } catch (err) {
                        loggingError('cannot del virtual thing config in temp' + err);
                    }
                    fs.rmdir(this.usedTempFolder, (err) => {
                        if (err) {
                            loggingError('unable to delete tmp dir: ' + err);
                            res();
                        } else {
                            res();
                        }
                    });
                } else {
                    loggingError('no tmp folder was found');
                    res();
                }
            } else {
                rej(new Error('Vt Process does not exist -> cannot exit'));
            }
        });
    }

    private initTmpFolder() {
        return new Promise((res, rej) => {

            this.usedTempFolder = null;

            const createTempTimeout = setTimeout(() => {
                rej(new Error('creating temp folder takes to long!'));
            }, 2000);
            fs.mkdtemp(path.join(os.tmpdir(), 'virtualthing-'), (err, genfolder) => {
                if (err) {
                    rej(new Error('problem with gen-temp-folder: ' + err));
                } else {
                    this.usedTempFolder = genfolder;
                    clearTimeout(createTempTimeout);
                    res();
                }
            });
        });
    }

    private writeTD() {
        return new Promise( (res, rej) => {
                if (this.usedTempFolder !== null) {
                    try {
                        fs.writeFileSync(path.join(this.usedTempFolder, 'vt-td.json'), this.givenTD);
                    } catch (err) {
                        rej(new Error('Cannot write given Td: ' + err));
                    }
                    res();
                } else {
                    rej(new Error('used temp folder is === null'));
                }
        });
    }
    private writeVtConfig() {
        return new Promise( (res, rej) => {
            if (this.usedTempFolder !== null) {
                try {
                    fs.writeFileSync(
                        path.join(this.usedTempFolder as string, 'vt-config.json'),
                        this.givenVtConfig
                    );
                } catch (err) {
                    rej(new Error('cannot write Vt config: ' + err));
                }
                res();
            } else {
                rej(new Error('used temp folder is === null'));
            }
        });
    }
    private startVt() {
        return new Promise( (res, rej) => {
                this.VtProcess = child_process.spawn(
                    'node',
                    [
                        path.join(__dirname, '..', '..', '..', '..', '..', 'virtual-thing', 'dist', 'cli'),
                        '-c',
                        path.join(this.usedTempFolder as string, 'vt-config.json'),
                        path.join(this.usedTempFolder as string, 'vt-td.json')
                    ]
                );

                this.VtProcess.on('error', (err) => {
                    rej(new Error ('Vt subprocess could not be spawned: '  + err));
                });

                if (this.VtProcess.stdout !== null) {
                    this.VtProcess.stdout.on('data', (cont) => {
                        this.writeOutTo.write(cont, (err) => {
                            if (err) {
                                loggingError(new Error('can\'t write to writeOutTo: ' + err));
                            }
                        });
                    }
                    );
                } else {
                    loggingError(new Error('Stdout does not exist'));
                }

                if (this.VtProcess.stderr !== null) {
                    this.VtProcess.stderr.on('data', (cont) => {
                        this.writeErrorTo.write(cont, (err) => {
                            if (err) {
                                loggingError(new Error('can\'t write to writeErrTo: ' + err));
                            }
                        });
                    }
                    );
                } else {
                    loggingError(new Error('StdErr does not exist'));
                }

                this.VtProcess.on('close', (code, signal) => {
                    if (code === 0 || code === null) {
                        // do nothing, process exited normally
                    } else {
                        loggingError(new Error('Vt exited with code: ' + code + 'on Signal: ' + signal));
                    }
                });

                res();
            });
    }

    private linkVt() {
        return new Promise( (res, rej) => {
            let VtConfParsed: any;
            let TdParsed: any;
            let VtConfAdr = '';
            let VtConfProtocol = '';
            let VtConfPort: string;
            let VtConfTitle = '';
            const Protocols = Object.keys(ProtocolEnum);

            try {
                VtConfParsed = JSON.parse(this.givenVtConfig);
                TdParsed = JSON.parse(this.givenTD);
            } catch (err) {
                rej(new Error('Could not parse a JSON object: ' + err));
            }

            if (VtConfParsed.servient.staticAddress) {
                VtConfAdr = VtConfParsed.servient.staticAddress;
            } else {
                this.writeErrorTo.write('Cannot create Virtual thing link, because not static Address is given in VT config');
                rej(new Error('no static address for vt given'));
            }

            if (TdParsed.title) {
                VtConfTitle = TdParsed.title;
            } else {
                loggingError('there was no title in the Thing description');
            }

            // Try to generate a link, prefer http because it is often more applied for testing
            if (VtConfParsed.servient.http) {
                VtConfProtocol = 'http';
                if (VtConfParsed.servient.http.port) {
                    VtConfPort = VtConfParsed.servient.http.port;
                } else {
                    VtConfPort = '';
                }
                this.link = VtConfProtocol + '://' + VtConfAdr + ':' + VtConfPort + '/' + VtConfTitle;
            } else if (VtConfParsed.servient.https) {
                VtConfProtocol = 'https';
                if (VtConfParsed.servient.https.port) {
                    VtConfPort = VtConfParsed.servient.https.port;
                } else {
                    VtConfPort = '';
                }
                this.link = VtConfProtocol + '://' + VtConfAdr + ':' + VtConfPort + '/' + VtConfTitle;
            }

            // Try to generate Linklist
            Protocols.forEach( (prot) => {
                VtConfProtocol = ProtocolEnum[prot];
                if (VtConfParsed.servient[VtConfProtocol]) {
                    if (VtConfParsed.servient[VtConfProtocol].port) {
                        VtConfPort = VtConfParsed.servient[VtConfProtocol].port;
                    } else {
                        VtConfPort = '';
                    }
                    this.copyLinks.push(VtConfProtocol + '://' + VtConfAdr + ':' + VtConfPort + '/' + VtConfTitle);
                } else {
                    // Protocoll is not mentioned in virtual thing config
                }
            });

        });
    }
}


