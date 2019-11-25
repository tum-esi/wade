// Parses a consumed Td to Vue 'Interaction' Component readable data

import * as WoT from 'wot-typescript-definitions';
import { PossibleInteractionTypesEnum, ProtocolEnum } from '@/util/enums';
import SizeCalculator from '@/backend/SizeCalculator';
import { customThingDescription } from './wot-custom';

export default class TdParser {
    private consumedTd: WoT.ConsumedThing | null;
    private parsedTd: any;
    private protocols: ProtocolEnum[];
    private SizeCalculator: any;

    constructor(consumedTd: WoT.ConsumedThing | null, protocols: ProtocolEnum[] | any = []) {
        this.consumedTd = consumedTd;
        this.parsedTd = {
            propertyInteractions: [],
            actionInteractions: [],
            eventInteractions: []
        };
        this.protocols = protocols;

        this.SizeCalculator = new SizeCalculator();

        this.parseProperties();
        this.parseActions();
        this.parseEvents();
    }

    public getParsedTd() {
        return this.parsedTd;
    }

    private parseProperties() {
        if (!this.consumedTd) return;

        for (const property in (this.consumedTd.getThingDescription() as customThingDescription).properties) {
            if (
                !(this.consumedTd.getThingDescription() as customThingDescription).properties.hasOwnProperty(property)
            ) {
                 continue;
            }

            // If it's MQTT you cannot write or read a property
            // You can only subscribe
            if (this.protocols.indexOf(ProtocolEnum.MQTT) !== -1) {
                this.parsedTd.propertyInteractions.push({
                    interactionName: `${property}: Observe`,
                    interactionType: PossibleInteractionTypesEnum.PROP_OBSERVE_READ,
                    interactionSelectBtn: {
                        btnInputType: this.getCorrectInputType(
                            (this.consumedTd.getThingDescription() as customThingDescription).properties[property]
                        ),
                        btnKey: `property-${property}-observe`,
                        btnGeneralStyle: 'btn-event-interaction',
                        btnSelectedStyle: 'btn-event-interaction-selected',
                        interaction: async () => {
                            if (!this.consumedTd) return { error: 'No consumed Thing available.' };
                            const response = await (
                                // TODO check if correct, has been properties[property].subscribe
                                this.consumedTd.observeProperty(property,
                                    async (res) => {
                                        return await res;
                                    }
                                )
                            );
                            return response;
                        }
                    }
                });
                continue;
            }

            // Readable properties
            if (!(this.consumedTd.getThingDescription() as customThingDescription).properties[property].writeOnly) {
                this.parsedTd.propertyInteractions.push({
                    interactionName: `${property}: Read`,
                    interactionType: PossibleInteractionTypesEnum.PROP_READ,
                    interactionSelectBtn: {
                        btnKey: `property-${property}-read`,
                        btnGeneralStyle: 'btn-event-interaction',
                        btnSelectedStyle: 'btn-event-interaction-selected',
                        interaction: async () => {
                            return getReadResponseWithTiming(this.consumedTd, this.SizeCalculator);
                        }
                    },
                });
            }

            async function getReadResponseWithTiming(
                consumedTd: WoT.ConsumedThing | null,
                sizeCalculator: SizeCalculator
            ) {
                if (!consumedTd) return { error: 'No consumed Thing available.' };
                const startTime = process.hrtime();
                const response = await consumedTd.readProperty(property)
                    .then(async (res) => {
                        await res;
                        const endTime = process.hrtime(startTime);
                        return {
                            res,
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: 'n.A.'
                        };
                    })
                    .catch(async (err) => {
                        await err;
                        const endTime = process.hrtime(startTime);
                        return {
                            res: undefined,
                            error: err,
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: 'n.A.'
                        };
                    });
                if (response.res !== undefined && response.res !== null) {
                    response.size = sizeCalculator.getSize(response.res);
                }
                return response;
            }

            // Writeable properties (have input)
            if (!(this.consumedTd.getThingDescription() as customThingDescription).properties[property].readOnly) {
                this.parsedTd.propertyInteractions.push({
                    interactionName: `${property}: Write`,
                    interactionType: PossibleInteractionTypesEnum.PROP_WRITE,
                    interactionSelectBtn: {
                        btnInputType: this.getCorrectInputType(
                            (this.consumedTd.getThingDescription() as customThingDescription).properties[property]
                        ),
                        btnKey: `property-${property}-write`,
                        btnGeneralStyle: 'btn-event-interaction',
                        btnSelectedStyle: 'btn-event-interaction-selected',
                        interaction: async (val: any, options?: any) => {
                            return getWriteResponseWithTiming(this.consumedTd, val, this.SizeCalculator, options);
                        }
                    },
                });
            }

            async function getWriteResponseWithTiming(
                consumedTd: WoT.ConsumedThing | null,
                val: any, sizeCalculator: SizeCalculator,
                options?: any) {
                if (!consumedTd) return { error: 'No consumed Thing available.' };
                const startTime = process.hrtime();
                const response = await consumedTd.writeProperty(property, val, options)
                    .then(async (res) => {
                        const endTime = process.hrtime(startTime);
                        return {
                            res: 'Success',
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: 'n.A.'
                        };
                    })
                    .catch(async (err) => {
                        await err;
                        const endTime = process.hrtime(startTime);
                        return {
                            res: undefined,
                            error: err,
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: 'n.A.'
                        };
                    });
                if (response.res) {
                    response.size =
                        options !== undefined ?
                        sizeCalculator.getSize(val) + sizeCalculator.getSize(options)
                        : sizeCalculator.getSize(val);
                }
                return response;
            }
        }
    }

    private parseActions() {
        if (!this.consumedTd) return;
        for (const action in (this.consumedTd.getThingDescription() as customThingDescription).actions) {
            if (!(this.consumedTd.getThingDescription() as customThingDescription).actions.hasOwnProperty(action)) {
                continue;
            }

            this.parsedTd.actionInteractions.push({
                interactionName: action,
                interactionType: PossibleInteractionTypesEnum.ACTION,
                interactionSelectBtn: {
                    btnInputType: this.getCorrectInputTypeActions(
                        (this.consumedTd.getThingDescription() as customThingDescription).actions[action]
                    ),
                    btnKey: `action-${action}`,
                    btnGeneralStyle: 'btn-event-interaction',
                    btnSelectedStyle: 'btn-event-interaction-selected',
                    interaction: async (input?: any) => {
                        return getActionsWithTiming(this.consumedTd, this.SizeCalculator, input);
                    }
                },
            });

            async function getActionsWithTiming(
                consumedTd: WoT.ConsumedThing | null,
                sizeCalculator: SizeCalculator,
                input?: any
            ) {
                if (!consumedTd) return { error: 'No consumed Thing available.' };
                const startTime = process.hrtime();
                const response = await consumedTd.invokeAction(action, input)
                    .then(async (res) => {
                        await res;
                        const endTime = process.hrtime(startTime);
                        return {
                            res: res || 'Success',
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: 'n.A.'
                        };
                    })
                    .catch(async (err) => {
                        await err;
                        const endTime = process.hrtime(startTime);
                        return {
                            error: err,
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: 'n.A.'
                        };
                    });
                // Measure size of input, if there is an input
                if (input) response.size = `Input ${sizeCalculator.getSize(input)}`;
                return response;
            }
        }
    }

    private parseEvents() {
        if (!this.consumedTd) return;
        for (const event in (this.consumedTd.getThingDescription() as customThingDescription).events) {
            if ( !(this.consumedTd.getThingDescription() as customThingDescription).events.hasOwnProperty(event)) {
                continue;
            }
            const eventInteraction = {
                interactionName: event,
                interactionType: PossibleInteractionTypesEnum.EVENT_SUB,
                interactionSelectBtn: {
                    btnKey: `select-${event}`,
                    btnGeneralStyle: 'btn-event-interaction',
                    btnSelectedStyle: 'btn-event-interaction-selected',
                    interaction: () => {
                        return {
                            subscribe: async (cbFunc: (data: any) => void) => {
                                if (!this.consumedTd) return { error: 'No consumed Thing available.' };
                                const response = await (
                                this.consumedTd.subscribeEvent(event,
                                    async (res) => {
                                        await res;
                                        cbFunc(res);
                                    })
                                );
                                return response;
                            },
                            unsubscribe: async () => {
                                if (this.consumedTd) {
                                    const response = await this.consumedTd.unsubscribeEvent(event);
                                    return response;
                                }
                            }
                        };
                    }
                }
            };
            this.parsedTd.eventInteractions.push(eventInteraction);
        }
    }

    // Get possible input types from property for interactions
    private getCorrectInputType(property: any) {
        const propEnum = property.enum ? property.enum :
            (property.input ? (property.input.enum ? property.input.enum : null) : null);
        const propType = property.type ? property.type :
            (property.input && property.input.type ? property.input.type : null);
        const propMin = (property.minimum || property.minimum === 0) ? property.minimum : null;
        const propMax = property.maximum ? property.maximum : null;
        const propMinLength = property.minLength ? property.minLength : null;
        const propMaxLength = property.maxLength ? property.maxLength : null;

        return {
            propType,
            propEnum,
            propMin,
            propMax,
            propMinLength,
            propMaxLength
        };
    }

    // Get possible action input types from property for interactions
    private getCorrectInputTypeActions(action: any) {
        const propType = action.input ?
            (action.input.type ? action.input.type : null) : null;
        const propEnum = action.enum ?
            action.enum
            : (action.input && action.input.enum ? action.input.enum : null);
        const propRequired = action.input ?
            (action.input.required ? action.input.required : null) : null;
        const propProperties = action.input ?
            (action.input.properties ? action.input.properties : null) : null;

        return {
            propType,
            propEnum,
            propRequired,
            propProperties
        };
    }
}
