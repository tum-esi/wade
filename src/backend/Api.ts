import TdConsumer from './TdConsumer';
import TdParser from './TdParser';
import PerformancePrediction from './PerformancePrediction';
import { PossibleInteractionTypesEnum, TdStateEnum, InteractionStateEnum, ProtocolEnum } from '@/util/enums';
import MessageHandler from './MessageHandler';

let tdConsumer: any = null;

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
    let consumedTd;
    // TODO: Check whenever a new TdConsumer is needed
    if (!tdConsumer) {
        tdConsumer = new TdConsumer(td, config, protocols);
        consumedTd = await tdConsumer.getConsumedTd();
    } else {
        tdConsumer.setConsumer(td, config, protocols);
        consumedTd = await tdConsumer.getConsumedTd();

    }

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

export async function startPerformancePrediction(interactions: any, settings: any) {
    // console.log('settings', settings);
    // With num runs
    const performancePredictor = new PerformancePrediction(
        interactions,
        settings.measurementType,
        settings.iterations,
        settings.duration,
        settings.numClients,
        settings.delayFirst,
        settings.delayBeforeEach,
        settings.measurementNum);
    const performanceResult = await performancePredictor.getPerformance();
    console.log('=== in API:', performanceResult);
    return await performanceResult;
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
                    // Invoke property read (no input)
                    const resultProp =
                        await selectedInteractions[interaction].interactionSelectBtn.interaction();

                    // Set property object for component
                    resultProps.push({
                        resultType: PossibleInteractionTypesEnum.PROP_READ,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultProp.error ? resultProp.error : resultProp.res,
                        resultTime: `${resultProp.s} sec ${resultProp.ms} ms`,
                        resultError: resultProp.error ? true : false,
                        resultSize: resultProp.size
                    });
                }
                break;
            case PossibleInteractionTypesEnum.PROP_WRITE:
                if (selectedInteractions[interaction].interactionSelectBtn.interaction) {
                    // Invoke property write (with input)
                    const resultProp =
                        await selectedInteractions[interaction]
                            .interactionSelectBtn.interaction(selectedInteractions[interaction]
                            .interactionSelectBtn.input);

                    // Set property object for component
                    resultProps.push({
                        resultType: PossibleInteractionTypesEnum.PROP_READ,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultProp.error ? resultProp.error : resultProp.res,
                        resultTime: `${resultProp.s}sec ${resultProp.ms}ms`,
                        resultError: resultProp.error ? true : false,
                        resultSize: resultProp.size === undefined ? 'n.a.' : `Input ${resultProp.size}`
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
                    // Invoke action (possibily with input)
                    const resultAction =
                        await selectedInteractions[interaction]
                            .interactionSelectBtn.interaction
                            (selectedInteractions[interaction].interactionSelectBtn.input);

                    // Set property object for component
                    resultActions.push({
                        resultType: PossibleInteractionTypesEnum.ACTION,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultAction.error ? resultAction.error : resultAction.res,
                        resultTime: `${resultAction.s} sec ${resultAction.ms} ms`,
                        resultError: resultAction.error ? true : false,
                        resultSize: resultAction.size
                    });
                    // resultAction = resultAction.error ? resultAction.error : resultAction;
                    // resultActions.push({
                    //     resultType: PossibleInteractionTypesEnum.ACTION,
                    //     resultTitle: selectedInteractions[interaction].interactionName,
                    //     resultValue: resultAction
                    // })
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
