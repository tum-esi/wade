import TdConsumer from './TdConsumer';
import TdParser from './TdParser';
import { PossibleInteractionTypesEnum, TdStateEnum, InteractionStateEnum } from '@/util/enums';
import MessageHandler from './MessageHandler';

export function updateStatusMessage(
    tdState: TdStateEnum | null,
    errorMsg: string | null,
    interactionState: InteractionStateEnum | null
): string {
    const messageHandler = new MessageHandler(tdState, errorMsg, interactionState);
    return messageHandler.getStatusMessage();
}

// Return vue-parsed td, td state information and possible errors
export async function consumeAndParseTd(td: string) {
    const consumedTd = await new TdConsumer(td).getConsumedTd();

    if (consumedTd.tdState !== TdStateEnum.VALID_CONSUMED_TD) {
        return {
            tdParsed: null,
            errorMsg: consumedTd.errorMsg,
            tdState: consumedTd.tdState
        };
    }
    const parsedTd = new TdParser(consumedTd.tdConsumed).getParsedTd();
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
                    // TODO: push unsubscribe?
                }
                break;
            case PossibleInteractionTypesEnum.EVENT_UNSUB:
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
