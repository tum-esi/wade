import * as WoT from 'wot-typescript-definitions';
import { PossibleInteractionTypesEnum } from '@/util/enums';

// Parses a consumed Td to Vue 'Interaction' Component readable data
export default class TdParser {
    private consumedTd: WoT.ConsumedThing;
    private parsedTd: any;

    constructor(consumedTd: WoT.ConsumedThing | any) {
        this.consumedTd = consumedTd;
        this.parsedTd = {
            propertyInteractions: [],
            actionInteractions: [],
            eventInteractions: []
        };

        this.parseProperties();
        this.parseActions();
        this.parseEvents();
    }

    public getParsedTd() {
        return this.parsedTd;
    }

    private parseProperties() {
        for (const property in this.consumedTd.properties) {
            if (!this.consumedTd.properties.hasOwnProperty(property)) { continue; }

            if (!this.consumedTd.properties[property].writeOnly) {
                this.parsedTd.propertyInteractions.push({
                    interactionName: `${property}: Read`,
                    interactionType: PossibleInteractionTypesEnum.PROP_READ,
                    interactionSelectBtn: {
                        btnKey: `property-${property}-read`,
                        btnGeneralStyle: 'btn-event-interaction',
                        btnSelectedStyle: 'btn-event-interaction-selected',
                        interaction: async () => {
                            const response = await this.consumedTd.properties[property].read()
                                .then( async (res) => {
                                    return await res;
                                })
                                .catch(async (err) => {
                                    return await { error: err };
                                });
                            return await response;
                        }
                    },
                });
            }

            if (!this.consumedTd.properties[property].readOnly) {
                this.parsedTd.propertyInteractions.push({
                    interactionName: `${property}: Write`,
                    interactionType: PossibleInteractionTypesEnum.PROP_WRITE,
                    interactionSelectBtn: {
                        btnInputType: this.getCorrectInputType(this.consumedTd.properties[property]),
                        btnKey: `property-${property}-write`,
                        btnGeneralStyle: 'btn-event-interaction',
                        btnSelectedStyle: 'btn-event-interaction-selected',
                        interaction: async (val: any, options?: any) => {
                            console.log('Interaction: val, options:', val, options);
                            const response = await this.consumedTd.properties[property].write(val, options)
                            .then( async (res) => {
                                console.log('Result in Prop write: ', res);
                                return await 'Success';
                            })
                            .catch( async (err) => {
                                console.log('Error in Prop read: ', err);
                                return await { error: err};
                            });
                            return await response;
                        }
                    },
                });
            }
        }
    }

    private parseActions() {
        for (const action in this.consumedTd.actions) {
            if (!this.consumedTd.actions.hasOwnProperty(action)) { continue; }

            this.parsedTd.actionInteractions.push({
                    interactionName: action,
                    interactionType: PossibleInteractionTypesEnum.ACTION,
                    interactionSelectBtn: {
                        btnInputType: this.getCorrectInputTypeActions(this.consumedTd.actions[action]),
                        btnKey: `action-${action}`,
                        btnGeneralStyle: 'btn-event-interaction',
                        btnSelectedStyle: 'btn-event-interaction-selected',
                        interaction: async (input?: any) => {
                            const response = await this.consumedTd.actions[action].invoke(input)
                                .then( async (res) => {
                                    if (res) { return await res; } else { return 'Success'; }
                                })
                                .catch(async (err) => {
                                    return await { error: err };
                        });
                            return await response;
                    }
                },
            });
        }
    }

    private parseEvents() {
        for (const event in this.consumedTd.events) {
            if (!this.consumedTd.events.hasOwnProperty(event)) { continue; }
            const eventInteraction = {
                interactionName: event,
                interactionType: PossibleInteractionTypesEnum.EVENT_SUB,
                interactionSelectBtn: {
                    btnKey: `select-${event}`,
                    btnGeneralStyle: 'btn-event-interaction',
                    btnSelectedStyle: 'btn-event-interaction-selected',
                    subscribe: async () => {
                        const response = await this.consumedTd.events[event].subscribe(
                            async (res) =>  {
                                console.log('Event-subscribtion: ', res);
                                return await res;
                             },
                            async (err) => {
                                console.log('Event-subscribtion Error: ', err);
                                return await err;
                            });
                        console.log('RESPONSE: ', response);
                        return await response;
                    },
                    unsubscribe: () => {
                        this.consumedTd.events[event].unsubscribe();
                    }
                }
            };
            this.parsedTd.eventInteractions.push(eventInteraction);
        }
    }

    // Get possible input types from property for interactions
    private getCorrectInputType(property: WoT.ThingProperty) {
        const propEnum = property.enum ? property.enum :
            (property.input ? (property.input.enum ? property.input.enum : null) : null);
        const propType = property.type ? property.type :
            (property.input.type ? property.input.type : 'string');
        const propMin = (property.minimum || property.minimum === 0) ? property.minimum : null;
        const propMax = property.maximum ? property.maximum : null;

        return {
            propType,
            propEnum,
            propMin,
            propMax
        };
    }

    // Get possible action input types from property for interactions
    private getCorrectInputTypeActions(action: any) {
        const propType = action.input ?
                        (action.input.type ? action.input.type : null) : null;
        const propRequired = action.input ?
                        (action.input.required ? action.input.required : null) : null;
        const propProperties = action.input ?
                        (action.input.properties ? action.input.properties : null) : null;

        return {
            propType,
            propRequired,
            propProperties
        };
    }
}
