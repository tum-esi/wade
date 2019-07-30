import { ErrorMessagesEnum, TdStateEnum, StatusMessagesEnum } from '@/util/enums';

export default class MessageHandler {

    private tdState: TdStateEnum | null;
    private errorMessage: string | null;

    constructor(tdState: TdStateEnum | null, errorMessage: string | null) {
        this.tdState = tdState;
        this.errorMessage = errorMessage;
    }

    public returnAccordingMessage(): StatusMessagesEnum | string {
        switch (this.tdState) {
            case TdStateEnum.NO_TD:
                return StatusMessagesEnum.NO_TD;
            case TdStateEnum.VALID_TD_JSON:
                return StatusMessagesEnum.VALID_TD_JSON;
            case TdStateEnum.INVALID_TD_JSON:
                return StatusMessagesEnum.INVALID_TD_JSON;
            case TdStateEnum.INVALID_TD_EMPTY:
                return StatusMessagesEnum.INVALID_TD_EMPTY;
            case TdStateEnum.INVALID_TD:
                return StatusMessagesEnum.INVALID_TD;
            case TdStateEnum.VALID_TD:
                return StatusMessagesEnum.VALID_TD;
            default:
            return '';
        }
    }
}
