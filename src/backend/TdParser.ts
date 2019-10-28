// Parses a consumed Td to Vue 'Interaction' Component readable data

import * as WoT from 'wot-typescript-definitions';
import { PossibleInteractionTypesEnum, ProtocolEnum } from '@/util/enums';
import SizeCalculator from '@/backend/SizeCalculator';

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
        for (const property in this.consumedTd.properties) {
            if (!this.consumedTd.properties.hasOwnProperty(property)) { continue; }

            // If it's MQTT you cannot write or read a property
            // You can only subscribe
            if (this.protocols.indexOf(ProtocolEnum.MQTT) !== -1) {
                this.parsedTd.propertyInteractions.push({
                    interactionName: `${property}: Observe`,
                    interactionType: PossibleInteractionTypesEnum.PROP_OBSERVE_READ,
                    interactionSelectBtn: {
                        btnInputType: this.getCorrectInputType(this.consumedTd.properties[property]),
                        btnKey: `property-${property}-observe`,
                        btnGeneralStyle: 'btn-event-interaction',
                        btnSelectedStyle: 'btn-event-interaction-selected',
                        interaction: async () => {
                            if (!this.consumedTd) return { error: 'No consumed Thing available.' };
                            const response = await this.consumedTd.properties[property]
                                .subscribe(
                                    async (res) => {
                                        return await res;
                                    },
                                    async (err) => {
                                        return await err;
                                    });
                            return await response;
                        }
                    }
                });
                continue;
            }

            // Readable properties
            if (!this.consumedTd.properties[property].writeOnly) {
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

            async function getReadResponseWithTiming(consumedTd: any, sizeCalculator: SizeCalculator) {
                if (!consumedTd) return { error: 'No consumed Thing available.' };
                const startTime = process.hrtime();
                const response = await consumedTd.properties[property].read()
                    .then(async (res) => {
                        await res;
                        const endTime = process.hrtime(startTime);
                        return {
                            res,
                            s: endTime[0],
                            ms: endTime[1] / 1000000
                        };
                    })
                    .catch(async (err) => {
                        await err;
                        const endTime = process.hrtime(startTime);
                        return {
                            error: err,
                            s: endTime[0],
                            ms: endTime[1] / 1000000
                        };
                    });
                if (response.res) response.size = sizeCalculator.getSize(response.res);
                return await response;
            }

            // Writeable properties (have input)
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
                            return getWriteResponseWithTiming(this.consumedTd, val, this.SizeCalculator, options);
                        }
                    },
                });
            }

            async function getWriteResponseWithTiming(
                consumedTd: any,
                val: any, sizeCalculator: SizeCalculator,
                options?: any) {
                if (!consumedTd) return { error: 'No consumed Thing available.' };
                const startTime = process.hrtime();
                const response = await consumedTd.properties[property].write(val, options)
                    .then(async (res) => {
                        const endTime = process.hrtime(startTime);
                        return {
                            res: 'Success',
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: undefined
                        };
                    })
                    .catch(async (err) => {
                        await err;
                        const endTime = process.hrtime(startTime);
                        return {
                            error: err,
                            s: endTime[0],
                            ms: endTime[1] / 1000000,
                            size: undefined
                        };
                    });
                if (response.res) {
                    response.size =
                        options !== undefined ?
                        sizeCalculator.getSize(val) + sizeCalculator.getSize(options)
                        : sizeCalculator.getSize(val);
                }
                return await response;
            }
        }
    }

    private parseActions() {
        if (!this.consumedTd) return;
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
                        return getActionsWithTiming(this.consumedTd, this.SizeCalculator, input);
                    }
                },
            });

            async function getActionsWithTiming(consumedTd: any, sizeCalculator: SizeCalculator, input?: any) {
                //
                if (!consumedTd) return { error: 'No consumed Thing available.' };
                const startTime = process.hrtime();
                const response = await consumedTd.actions[action].invoke(input)
                    .then(async (res) => {
                        await res;
                        const endTime = process.hrtime(startTime);
                        return {
                            res: res || 'Success',
                            s: endTime[0],
                            ms: endTime[1] / 1000000
                        };
                    })
                    .catch(async (err) => {
                        await err;
                        const endTime = process.hrtime(startTime);
                        return {
                            error: err,
                            s: endTime[0],
                            ms: endTime[1] / 1000000
                        };
                    });
                // Don't measure size if there is only an error or it's the default 'Success' message
                if (response.res && response.res !== 'Success') response.size = sizeCalculator.getSize(response.res);
                return await response;
            }
        }
    }

    private parseEvents() {
        if (!this.consumedTd) return;
        for (const event in this.consumedTd.events) {
            if (!this.consumedTd.events.hasOwnProperty(event)) { continue; }
            const eventInteraction = {
                interactionName: event,
                interactionType: PossibleInteractionTypesEnum.EVENT_SUB,
                interactionSelectBtn: {
                    btnKey: `select-${event}`,
                    btnGeneralStyle: 'btn-event-interaction',
                    btnSelectedStyle: 'btn-event-interaction-selected',
                    subscribe: () => {
                        if (!this.consumedTd) return { error: 'No consumed Thing available.' };
                        return this.consumedTd.events[event];
                    },
                    unsubscribe: () => {
                        if (this.consumedTd) return this.consumedTd.events[event];
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
