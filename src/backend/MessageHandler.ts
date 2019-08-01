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

    public getStatusMessage(): string {
        const date = new Date();
        const currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        let message = `${currentTime}> `;

        if (this.tdState) message += `${this.tdState} `;
        if (this.errorMessage) message += `Error: ${this.errorMessage}. `;
        if (this.interactionState) message += `${this.interactionState} `;

        return message;
    }
}
