import { Servient } from '@node-wot/core';
import { HttpClientFactory, HttpConfig } from '@node-wot/binding-http';
import { TdStateEnum } from '@/util/enums';

export default class TdConsumer {

    private td: string;
    private tdJson: JSON | null;
    private tdConsumed: WoT.ConsumedThing | null;
    private tdState: TdStateEnum | null;
    private errorMsg: string | null;

    constructor(td: string) {
        this.td = td;
        this.tdJson = null;
        this.tdConsumed = null;
        this.tdState = null;
        this.errorMsg = null;
    }

    public async getConsumedTd() {
        await this.parseTdJson(this.td);
        if (this.tdState === TdStateEnum.VALID_TD_JSON) await this.consumeThing();

        return { tdJson: this.tdJson, tdConsumed: this.tdConsumed, tdState: this.tdState, errorMsg: this.errorMsg };
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
        } catch (err) {
            this.tdState = TdStateEnum.INVALID_TD_JSON;
            this.errorMsg = err;
        }
    }

    // Tries to consume given td json object
    private async consumeThing() {
        const servient = new Servient();

        // TODO: add HttpConfig
        await servient.addClientFactory(new HttpClientFactory({ port: 8080 }));

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
