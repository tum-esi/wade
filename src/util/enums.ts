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

export enum PossibleInteractionTypesEnum {
  PROP_READ = 'property-read',
  PROP_WRITE = 'property-write',
  ACTION = 'action-invoke',
  EVENT_SUB = 'event-subscribe',
  EVENT_UNSUB = 'event-unsubscribe'
}

export enum InteractionStateEnum {
  // No / invalid td
  NO_INTERACTIONS = 'No interactions can be shown.',
  NOT_SELECTED = 'Select an interaction to invoke it.',
  NOT_INVOKED = 'Interactions are selected. Click invoke button to invoke them.',
  INVOKED = 'Interactions have been invoked.',
}

export enum TdStateEnum {
  NO_TD = 'NO TD: No TD is uploaded.',
  VALID_TD_JSON = 'VALID JSON: TD is valid JSON.',
  INVALID_TD_JSON = 'INVALID JSON: TD is invalid JSON.',
  VALID_CONSUMED_TD = 'CONSUMED: TD has been successfully consumed.',
  VALID_TD_FETCHED = 'FETCH SUCCESS: TD has successfully been fetched.',
  INVALID_TD_FETCHED = 'FETCH ERROR: TD could not be fetched.',
  INVALID_TD_EMPTY = 'INVALID TD: TD may not be empty object.',
  INVALID_CONSUMED_TD = 'CONSUME ERROR: TD could not be consumed.',
  INVALID_TD = 'INVALID TD: TD is invalid.',
  VALID_TD = 'VALID TD: TD is valid.'
}
