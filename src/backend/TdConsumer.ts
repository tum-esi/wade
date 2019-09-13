import { Servient } from '@node-wot/core';
import { HttpClientFactory, HttpsClientFactory } from '@node-wot/binding-http';
import { CoapClientFactory, CoapsClientFactory, CoapServer } from '@node-wot/binding-coap';
import { MqttClientFactory, MqttBrokerServer } from '@node-wot/binding-mqtt';
import { WebSocketClientFactory, WebSocketSecureClientFactory } from '@node-wot/binding-websockets';

import { TdStateEnum } from '@/util/enums';

export default class TdConsumer {

    private td: string;
    private config: any;
    private tdJson: JSON | null;
    private tdConsumed: WoT.ConsumedThing | null;
    private tdState: TdStateEnum | null;
    private errorMsg: string | null;
    private defaultConfig: any;

    constructor(td: string, config: any) {
        this.td = td;
        this.config = config;
        this.tdJson = null;
        this.tdConsumed = null;
        this.tdState = null;
        this.errorMsg = null;
    }

    public async getConsumedTd() {
        await this.parseTdJson(this.td);
        if (this.tdState === TdStateEnum.VALID_TD_JSON) await this.consumeThing();

        return {
            tdJson: this.tdJson,
            tdConsumed: this.tdConsumed,
            tdState: this.tdState, errorMsg: this.errorMsg
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
        const servient = new Servient();
        if (this.config && this.config.credentials) servient.addCredentials(this.config.credentials);

        // const DEFAULT_COAP_PORT = 5683;
        const DEFAULT_COAP_PORT = 5055;
        const DEFAULT_HTTP_PORT = 8080;
        const DEFAULT_MQTT_PORT = 1883;

        const MQTT_CONFIG = {
            uri: 'mqtt://localhost:1883',
            username: undefined,
            password: undefined,
            clientId: undefined,
            port: DEFAULT_MQTT_PORT
        };

        // TODO: Only do this if it is mqtt -> stop if it takes longer
        // Needed to publish data to a broker (needed for propertiers)
        // const mqttBrokerServer =
        //     new MqttBrokerServer(MQTT_CONFIG.uri, MQTT_CONFIG.username, MQTT_CONFIG.password, MQTT_CONFIG.clientId);
        // servient.addServer(mqttBrokerServer);


        // await servient.addClientFactory(new HttpClientFactory({ port: 8080 }));

        // const coapServer = new CoapServer(DEFAULT_COAP_PORT);
        // await servient.addServer(coapServer);

        // TODO .addCredentials
        await servient.addClientFactory(new HttpClientFactory({}));
        // await servient.addClientFactory(new HttpClientFactory({ port: 8080 }));
        await servient.addClientFactory(new HttpsClientFactory({}));
        // await servient.addClientFactory(new WebSocketClientFactory());
        // await servient.addClientFactory(new WebSocketSecureClientFactory());
        await servient.addClientFactory(new CoapClientFactory());
        // await servient.addClientFactory(new CoapClientFactory(coapServer));
        await servient.addClientFactory(new CoapsClientFactory());

        await servient.addClientFactory(new MqttClientFactory());

        await servient.start().then((thingFactory) => {
            this.tdConsumed = thingFactory.consume(JSON.stringify(this.tdJson));
            this.tdState = TdStateEnum.VALID_CONSUMED_TD;
            this.errorMsg = null;
        }).catch((err) => {
            this.tdConsumed = null;
            this.tdState = TdStateEnum.INVALID_CONSUMED_TD;
            this.errorMsg = err;
        });
    }
}
