import * as path from 'path';
import * as fs from 'fs';
import * as WoT from 'wot-typescript-definitions';
import * as os from 'os';
import * as child_process from 'child_process';
import * as stream from 'stream';
import {VtStatus} from '@/util/enums';
// import { readFile , readFileSync } from "fs";
// import { join } from "path";

export default class VtCall {
    public debug: string;
    public status: VtStatus;

    private givenTD: string|null;
    private givenVtConfig: string;
    private usedTempFolder: string|null;
   /* private givenTdId: string;*/
    private VtProcess: child_process.ChildProcess | null;
    private writeOutTo: stream.Writable;
    private writeErrorTo: stream.Writable;

    constructor(
            givenVtConfig: string,
            // givenTdId: string,
            writeOutTo: stream.Writable,
            writeErrorTo: stream.Writable,
            givenTD?: WoT.ThingDescription,
        ) {
        this.givenVtConfig = givenVtConfig;
        this.debug = '';
        this.usedTempFolder = null;
        // this.givenTdId = givenTdId;
        this.VtProcess = null;
        this.writeOutTo = writeOutTo;
        this.writeErrorTo = writeErrorTo;
        this.status = VtStatus.STARTUP;
        if (givenTD === undefined) {
            this.givenTD = null;
        } else {
            this.givenTD = givenTD;
        }


    }

    public launchVt() {
        return new Promise( (res, rej) => {
            this.status = VtStatus.STARTUP;
            this.initTmpFolder()
            .then( () => {
                console.debug('tmp folder created: ', this.usedTempFolder);
                this.writeTD();
            }, () => {
                this.debug += '<problem with init tmp folder';
                rej();
            })

            .then( () => {
                this.writeVtConfig();
                }, () => {
                this.debug += '<problem with writeTD> ';
                rej();
            })
            .then( () => {
                this.startVt();
            }, () => {
                this.debug += '<problem with writeVtConfig> ';
                rej();
            })
            .then( () => {
                this.status = VtStatus.RUNNING;
                res();
            }, () => {
                this.debug += 'problem at startVt';
                rej();
            });
        });
    }

    public stopVt() {
        return new Promise( (res, rej) => {
            if (this.VtProcess !== null) {
                this.VtProcess.kill();
                this.writeOutTo.write('virtual thing entity was stopped');
                if (this.usedTempFolder !== null) {
                    fs.rmdir(this.usedTempFolder, (err) => {
                        if (err) {
                            this.writeErrorTo.write('unable to delete tmp dir');
                            res();
                        } else {
                            this.writeOutTo.write('tmp dir is removed');
                            res();
                        }
                    });
                } else {
                    this.writeErrorTo.write('no tmp folder was found');
                }
            } else {
                rej(new Error('Vt Process does not exist -> can\'t exit'));
                console.debug('no VTProcess to be killed');
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
                    this.debug += 'problem with gen-temp-folder' + err ;
                    rej();
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
            if ( this.givenTD === null) {
                try {
                    console.debug(path.join(
                        __dirname, '..', '..', '..', '..', '..', 'virtual-thing', 'examples', 'td', 'coffee_machine_td.json'
                    ));
                    fs.copyFileSync(
                        path.join(
                            __dirname, '..', '..', '..', '..', '..', 'virtual-thing', 'examples', 'td', 'coffee_machine_td.json'
                        ),
                        path.join(
                            this.usedTempFolder as string, /* this.givenTdId,*/ 'vt-td.json'
                        )
                    );
                } catch (err) {
                    rej(new Error('Cannot copy coffee machine td, err: ' + err));
                }
                res();
            } else {
                try {
                    fs.writeFileSync(path.join(this.usedTempFolder as string, 'vt-td.json'), this.givenTD);
                } catch (err) {
                    rej(new Error('Cannot write given Td: ' + err));
                }
                res();
            }
        });
    }
    private writeVtConfig() {
        return new Promise( (res, rej) => {
            fs.writeFileSync(
                path.join(this.usedTempFolder as string, /* this.givenTdId,*/ 'vt-config.json'),
                this.givenVtConfig
            );
            res();
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
                    this.writeErrorTo.write('Vt subprocess could not be spawned: '  + err);
                    rej();
                });

                if (this.VtProcess.stdout !== null) {
                    this.VtProcess.stdout.on('data', (cont) => {
                        console.debug('STD-out: ', cont);
                        this.writeOutTo.write(cont, (err) => {
                            if (err) {
                                throw new Error('can\'t write to writeOutTo');
                            }
                        });
                    }
                    );
                } else {
                    throw new Error('Stdout does not exist');
                }

                if (this.VtProcess.stderr !== null) {
                    this.VtProcess.stderr.on('data', (cont) => {
                        console.debug('STD-err: ', cont);
                        this.writeErrorTo.write(cont, (err) => {
                            if (err) {
                                throw new Error('>>> can\'t write to writeErrTo <br>');
                            }
                        });
                    }
                    );
                } else {
                    throw new Error('>>> StdErr does not exist <br>');
                }

                this.VtProcess.on('close', (code) => {
                    if (code === 0) {
                        this.writeOutTo.write('>>> Vt process exited normally <br>');
                    } else {
                        this.writeErrorTo.write('>>> Vt exited with code: ' + code + '<br>');
                    }
                });

                this.VtProcess.on('exit', (code) => {
                    if (code === 0) {
                        this.writeOutTo.write('>>> EXIT: Vt process exited normally <br>');
                    } else {
                        this.writeErrorTo.write('>>> EXIT: Vt exited with code: ' + code + '<br>');
                    }
                });

                res();
            });
        }
}
