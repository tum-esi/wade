import TdConsumer from './TdConsumer';
import TdParser from './TdParser';
import { PossibleInteractionTypesEnum } from '@/util/enums';

export async function getParsedTd(jsonTD: JSON) {
    const consumedTdResponse = await new TdConsumer(jsonTD).getConsumedThing();
    if (consumedTdResponse.error) {
        // TODO: handling of errors instead of parsedTd
        return consumedTdResponse.error;
    } else {
        return new TdParser(consumedTdResponse.consumedThing).getParsedTd();
    }
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
                    resultProp = resultProp.error ? resultProp.error : resultProp;
                    resultProps.push({
                        resultType: PossibleInteractionTypesEnum.PROP_READ,
                        resultTitle: selectedInteractions[interaction].interactionName,
                        resultValue: resultProp
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

    return  {
        resultProps,
        resultActions,
        resultEvents
    };
}
