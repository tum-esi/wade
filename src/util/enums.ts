export enum ElementTypeEnum {
  FOLDER = 'folder',
  TD = 'td',
  MASHUP = 'mashup'
}

export enum ElementTitleEnum {
  FOLDER = 'Folder',
  TD = 'Thing Description',
  MASHUP = 'Mashup'
}

export enum ErrorMessagesEnum {
  INVALID_JSON_TD = 'ERROR: TD is not a valid JSON.',
  EMPTY_TD = 'ERROR: TD may not be empty.',
  NO_INTERACTIONS_TD = 'NO INTERACTIONS: TD does not contain any interactions.',
  CONSUMER_ERROR = 'ERROR: Could not consume thing: '
}

export enum StatusMessagesEnum {
  TD_READY = 'VALID: TD is JSON, invoke interactions.'
}

export enum PossibleInteractionTypesEnum {
  PROP_READ = 'property-read',
  PROP_WRITE = 'property-write',
  ACTION = 'action-invoke',
  EVENT_SUB = 'event-subscribe',
  EVENT_UNSUB = 'event-unsubscribe'
}
