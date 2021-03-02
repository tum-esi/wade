import { Servient } from '@node-wot/core';
import { HttpClientFactory, HttpsClientFactory } from '@node-wot/binding-http';
import { CoapClientFactory, CoapsClientFactory, CoapServer } from '@node-wot/binding-coap';
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

    private servient: any | null; // TODO: there is no servient type in wot-typescript-definitions

    constructor(td: string, config: any, protocols: string[]) {
        this.td = td;
        this.config = config;
        this.protocols = protocols;
        this.tdJson = null;
        this.tdConsumed = null;
        this.tdState = null;
        this.errorMsg = null;
        this.servient = null;
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

    // Tries to consume given td json object
    private async consumeThing() {
        // console.log('servient:', this.servient);
        // if (this.servient) this.servient.shutdown();
        this.servient = new Servient();

        // Get config of td, possibly altered by user
        if (this.config && this.config.credentials) this.servient.addCredentials(this.config.credentials);

        // Now check which ClientFactories need to be added (based on the given protocols)

        if (this.protocols.indexOf('mqtt') !== -1) {
            if (!this.config || !this.config.mqtt) {
                // mqtt config was found -> cannot connect to broker
                this.tdState = TdStateEnum.INVALID_CONSUMED_TD;
                this.errorMsg = 'No mqtt broker credentials were found in config';
                return;
            }

            // Set mqtt config from config (possibily entered by user)
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

            await this.servient.addClientFactory(new MqttClientFactory());
        }

        if (this.protocols.indexOf('coap') !== -1) {
            await this.servient.addClientFactory(new CoapClientFactory());
        }

        if (this.protocols.indexOf('coaps') !== -1) {
            await this.servient.addClientFactory(new CoapsClientFactory());
        }

        if (this.protocols.indexOf('http') !== -1) {
            await this.servient.addClientFactory(new HttpClientFactory({}));
        }

        if (this.protocols.indexOf('https') !== -1) {
            await this.servient.addClientFactory(new HttpsClientFactory({}));
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
