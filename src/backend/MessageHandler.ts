import { TdStateEnum, InteractionStateEnum } from '@/util/enums';

export default class MessageHandler {

    private tdState: TdStateEnum | null;
    private errorMessage: string | null;
    private interactionState: InteractionStateEnum | null;

    constructor(
        tdState: TdStateEnum | null,
        errorMessage: string | null,
        interactionState: InteractionStateEnum | null
    ) {
        this.tdState = tdState;
        this.errorMessage = errorMessage;
        this.interactionState = interactionState;
    }

    public getStatusMessage(): { message: string, error: boolean } {
        let hasError = false;
        const date = new Date();
        const currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        let message = `${currentTime}> `;

        if (this.tdState) {
            message += `${this.tdState} `;
            if (this.tdState === TdStateEnum.NO_TD
                || this.tdState === TdStateEnum.INVALID_TD_JSON
                || this.tdState === TdStateEnum.INVALID_TD_FETCHED
                || this.tdState === TdStateEnum.INVALID_TD_EMPTY
                || this.tdState === TdStateEnum.INVALID_CONSUMED_TD
                || this.tdState === TdStateEnum.INVALID_TD) hasError = true;
        }
        if (this.errorMessage) {
            message += `Error: ${this.errorMessage}. `;
            hasError = true;
        }
        if (this.interactionState) message += `${this.interactionState} `;

        return { message, error: hasError };
    }
}
