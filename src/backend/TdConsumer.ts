import { Servient, Helpers } from '@node-wot/core';
import { HttpClientFactory, HttpsClientFactory } from '@node-wot/binding-http';
import { CoapClientFactory, CoapsClientFactory } from '@node-wot/binding-coap';
import { MqttClientFactory, MqttBrokerServer } from '@node-wot/binding-mqtt';
// import { WebSocketClientFactory, WebSocketSecureClientFactory } from '@node-wot/binding-websockets';
import { TdStateEnum } from '@/util/enums';
import * as WoT from 'wot-typescript-definitions';

export default class TdConsumer {
    // default coap port = 5683;
    // default mqtt port = 1883;
    // default http port = 8080;

    private td: string;
    private config: any;
    private protocols: string[];
    private tdJson: JSON | null;
    private tdConsumed: WoT.ConsumedThing | null;
    private tdState: TdStateEnum | null;
    private errorMsg: string | null;

    private servient: Servient;
    private helper: Helpers;

    constructor(td: string, config: any, protocols: string[]) {
        this.td = td;
        this.config = config;
        this.protocols = protocols;
        this.tdJson = null;
        this.tdConsumed = null;
        this.tdState = null;
        this.errorMsg = null;
        // instantiate Servient and Helper
        this.servient = new Servient();
        this.helper = new Helpers(this.servient);
        // Add all ClientFactories
        this.servient.addClientFactory(new CoapClientFactory());
        this.servient.addClientFactory(new CoapsClientFactory());
        this.servient.addClientFactory(new HttpClientFactory({}));
        this.servient.addClientFactory(new HttpsClientFactory({}));
        this.servient.addClientFactory(new MqttClientFactory());
    }

    public setConsumer(td: string, config: any, protocols: string[]) {
        this.td = td;
        this.config = config;
        this.protocols = protocols;
    }
    public async getConsumedTd(): Promise<{
        tdJson: JSON | null,
        tdConsumed: WoT.ConsumedThing | null,
        tdState: TdStateEnum | null,
        errorMsg: string | null
    }> {
        await this.parseTdJson(this.td);

        // if the td is in valid json format, consume it.
        if (this.tdState === TdStateEnum.VALID_TD_JSON) await this.consumeThing();

        return {
            tdJson: this.tdJson,
            tdConsumed: this.tdConsumed,
            tdState: this.tdState,
            errorMsg: this.errorMsg
        };
    }


    // Tries to parse given td-string to a json object
    private async parseTdJson(td: string) {
        this.tdState = null;
        this.tdJson = null;
        this.tdConsumed = null;
        this.errorMsg = null;

        if (!td.length) return;

        try {
            this.tdJson = JSON.parse(td);
            this.tdState = TdStateEnum.VALID_TD_JSON;
            // May not be empty json
            if (Object.getOwnPropertyNames(this.tdJson).length === 0) this.tdState = TdStateEnum.INVALID_TD_EMPTY;
        } catch (err) {
            this.tdState = TdStateEnum.INVALID_TD_JSON;
            this.errorMsg = err;
        }
    }

    /** A method that fetches a TD using node-wot fetch API.
     * The method takes a URI string as input and returns a Promise of a WoT.ThingDescription.
     * If no connection is established for 3 seconds, the fetching times out and throws "Fetching Timed Out".
     * Otherwise, if any other error occurs, the fetching is initiated upto 3 times.
     * If the error is persists, the error is thrown
     * @param uri A uri string that represents that represents the TD resource 
     */
    async fetchTD(uri: string) {
        let errorCount = 0
        let helper = this.helper;
        let errorMsg: string | Error | null = null; 
        let td: WoT.ThingDescription;
        return new Promise<WoT.ThingDescription>(async (resolve, reject) => {
            setTimeout(() => {
                reject("Fetching Timed Out");
            },3000);
            do {
                try {
                    td = await helper.fetch(uri)
                    if(td) return resolve(td); else errorCount++;
                } catch (err) {
                    errorMsg = err;
                    errorCount++;
                }
            } while(errorCount <= 3)
            reject(errorMsg);
        })
    }

    // Tries to consume given td json object
    private async consumeThing() {
        if (this.config && this.config.credentials) this.servient.addCredentials(this.config.credentials);

        // perform mqtt specific operations if required
        if (this.protocols.indexOf('mqtt') !== -1) {
            if (!this.config || !this.config.mqtt) {
                // mqtt config was not found -> cannot connect to broker
                this.tdState = TdStateEnum.INVALID_CONSUMED_TD;
                this.errorMsg = 'No mqtt broker credentials were found in config';
                return;
            }

            // Set mqtt config from config (possibly entered by user)
            const MQTT_CONFIG: WADE.MqttConfigInterface = {
                broker: this.config.mqtt.broker || '',
                username: this.config.mqtt.username || undefined,
                password: this.config.mqtt.password || undefined,
                clientId: this.config.mqtt.clientId || undefined
            };

            // Add broker credentials
            const mqttBrokerServer = new MqttBrokerServer(
                MQTT_CONFIG.broker,
                MQTT_CONFIG.username,
                MQTT_CONFIG.password,
                MQTT_CONFIG.clientId
            );
            this.servient.addServer(mqttBrokerServer);
        }

        // await servient.addClientFactory(new WebSocketClientFactory());
        // await servient.addClientFactory(new WebSocketSecureClientFactory());

        await this.servient.start().then( async (factory: WoT.WoT) => {
            if (this.tdJson) {
                const TdPromise = factory.consume(this.tdJson);
                await TdPromise.then( (Td) => {this.tdConsumed = Td; },
                (err) => {throw new Error('Td was not consumed successfully' + err); } );
                this.tdState = TdStateEnum.VALID_CONSUMED_TD;
                this.errorMsg = null;
                this.servient.shutdown();
            } else {
                throw new Error('tdJson is undefined');
            }
        }).catch((err) => {
            this.tdConsumed = null;
            this.tdState = TdStateEnum.INVALID_CONSUMED_TD;
            this.errorMsg = err;
            this.servient.shutdown();
        });
    }
}
