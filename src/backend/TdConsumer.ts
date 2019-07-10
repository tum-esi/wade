import { Servient, ConsumedThing } from '@node-wot/core';
import { HttpClientFactory, HttpConfig } from '@node-wot/binding-http';
import { ErrorMessagesEnum } from '@/util/enums';



export default class TdConsumer {

    private td: JSON;
    private consumedThingResponse: any;

    constructor(td: JSON) {
        this.td = td;
        this.consumedThingResponse = {};
    }

    public async getConsumedThing() {
        await this.consumeThing();
        return this.consumedThingResponse;
    }

    private consumeThing() {
        const servient = new Servient();
        servient.addClientFactory(new HttpClientFactory({ port: 8080 })); // TODO: add HttpConfig

        // Consume Thing
        servient.start().then((thingFactory) => {
            const consumedThing = thingFactory.consume(JSON.stringify(this.td));
            this.consumedThingResponse.consumedThing = consumedThing;
        }).catch((err) => {
            this.consumedThingResponse.error =  `${ErrorMessagesEnum.CONSUMER_ERROR} ${err}.`;
        });
    }

}
