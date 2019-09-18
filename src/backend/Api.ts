import TdConsumer from './TdConsumer';
import TdParser from './TdParser';
import { PossibleInteractionTypesEnum, TdStateEnum, InteractionStateEnum, ProtocolEnum } from '@/util/enums';
import MessageHandler from './MessageHandler';

export function retrieveProtocols(td: string): ProtocolEnum[] | null {
    const protocols = [] as ProtocolEnum[];
    let tdJson;
    try {
        tdJson = JSON.parse(td);
    } catch (error) {
        return protocols;
    }

    // Check forms of properties and add protocols
    function addProtocols(interactions) {
        for (const el in interactions) {
            if (!interactions.hasOwnProperty(el)) continue;
            if (!interactions[el].forms) break;
            for (const form of interactions[el].forms) {
                if (form.href && form.href.indexOf('http') !== -1) {
                    protocols.push(ProtocolEnum.HTTP);
                }
                if (form.href && form.href.indexOf('https') !== -1) {
                    protocols.push(ProtocolEnum.HTTPS);
                }
                if (form.href && form.href.indexOf('mqtt') !== -1) {
                    protocols.push(ProtocolEnum.MQTT);
                }
                if (form.href && form.href.indexOf('coap') !== -1) {
                    protocols.push(ProtocolEnum.COAP);
                }
                if (form.href && form.href.indexOf('coaps') !== -1) {
                    protocols.push(ProtocolEnum.COAPS);
                }
            }
        }
    }

    if (tdJson.properties) addProtocols(tdJson.properties);
    if (tdJson.actions) addProtocols(tdJson.actions);
    if (tdJson.events) addProtocols(tdJson.events);

    return Array.from(new Set(protocols));
}

export function updateStatusMessage(
    tdState: TdStateEnum | null,
    errorMsg: string | null,
    interactionState: InteractionStateEnum | null
): { message: string, error: boolean } {
    const messageHandler = new MessageHandler(tdState, errorMsg, interactionState);
    return messageHandler.getStatusMessage();
}

// Return vue-parsed td, td state information and possible errors
export async function consumeAndParseTd(td: string, config: object, protocols: ProtocolEnum[]) {
    const consumedTd = await new TdConsumer(td, config, protocols).getConsumedTd();

    if (consumedTd.tdState !== TdStateEnum.VALID_CONSUMED_TD) {
        return {
            tdParsed: null,
            errorMsg: consumedTd.errorMsg,
            tdState: consumedTd.tdState
        };
    }
    const parsedTd = new TdParser(consumedTd.tdConsumed, protocols).getParsedTd();
    return {
        tdParsed: parsedTd,
        errorMsg: null,
        tdState: consumedTd.tdState
    };
}

export async function resetAll() {
    // TODO:
    // delete TdConsumer
    // delete TdParser
    // -> rewrite getParsedTd -> TdConsumer/ TdParser global & new methods 'reset', 'init', ..
}

export async function invokeInteractions(selectedInteractions) {
    const resultProps: any[] = [];
    const resultActions: any[] = [];
    const resultEvents: any[] = [];

    for (const interaction in selectedInteractions) {
        if (!selectedInteractions.hasOwnProperty(interaction)) { continue; }

        switch (selectedInteractions[interaction].interactionType) {
            case PossibleInteractionTypesEnum.PROP_READ:
                if (selectedInteractions[interaction].interactionSelectBtn.interaction) {
                    let resultProp =
                        await selectedInteractions[interaction].interactionSelectBtn.interaction();
                    const resultHasError = resultProp.error ? true : false;
                    resultProp = resultHasError ? resultProp.error : resultProp;
                    resultProps.push({
                        resultType: PossibleInteractionTypesEnum.PROP_READ,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultProp,
                        resultError: resultHasError
                    });
                }
                break;
            case PossibleInteractionTypesEnum.PROP_WRITE:
                if (selectedInteractions[interaction].interactionSelectBtn.interaction) {
                    let resultProp =
                        await selectedInteractions[interaction]
                        .interactionSelectBtn.interaction(selectedInteractions[interaction].interactionSelectBtn.input);
                    resultProp = resultProp.error ? resultProp.error : resultProp;
                    resultProps.push({
                        resultType: PossibleInteractionTypesEnum.PROP_READ,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultProp
                    });
                }
                break;
            case PossibleInteractionTypesEnum.EVENT_SUB:
                if (selectedInteractions[interaction].interactionSelectBtn.subscribe) {
                    let resultEvent = await selectedInteractions[interaction].interactionSelectBtn.subscribe();
                    resultEvent = resultEvent.error ? resultEvent.error : resultEvent;
                    resultEvents.push({
                        resultType: PossibleInteractionTypesEnum.EVENT_SUB,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultEvent
                    });
                }
                break;
            case PossibleInteractionTypesEnum.EVENT_UNSUB:
                break;
            case PossibleInteractionTypesEnum.PROP_OBSERVE_READ:
            case PossibleInteractionTypesEnum.PROP_OBSERVE_WRITE:
                if (selectedInteractions[interaction].interactionSelectBtn.interaction) {
                    let resultProp = await selectedInteractions[interaction].interactionSelectBtn.interaction();
                    resultProp = resultProp.error ? resultProp.error : resultProp;
                    resultProps.push({
                        resultType: PossibleInteractionTypesEnum.PROP_OBSERVE_READ,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultProp
                    });
                }
                break;
            case PossibleInteractionTypesEnum.ACTION:
                if (selectedInteractions[interaction].interactionSelectBtn.interaction) {
                    let resultAction =
                        await selectedInteractions[interaction]
                        .interactionSelectBtn.interaction(selectedInteractions[interaction].interactionSelectBtn.input);
                    resultAction = resultAction.error ? resultAction.error : resultAction;
                    resultActions.push({
                        resultType: PossibleInteractionTypesEnum.ACTION,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultAction
                    });
                }
                break;
            default:
                break;
        }
    }

    return {
        resultProps,
        resultActions,
        resultEvents
    };
}
