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
  NO_TD = '',
  VALID_TD_JSON = 'Valid json td.',
  INVALID_TD_JSON = 'Td is not in correct JSON f',
  TD_READY = 'VALID: TD is JSON, invoke interactions.',
  INVALID_TD_EMPTY = 'empty-td',
  INVALID_TD = 'invalid-td',
  VALID_TD = 'valid-td'
}

export enum PossibleInteractionTypesEnum {
  PROP_READ = 'property-read',
  PROP_WRITE = 'property-write',
  ACTION = 'action-invoke',
  EVENT_SUB = 'event-subscribe',
  EVENT_UNSUB = 'event-unsubscribe'
}

// Maybe later own class?
export enum InteractionStateEnum {
  // No or not valid td
  NO_INTERACTIONS = 'no-interactions',
  // Interactions should be shown, nothing selected
  NOT_SELECTED = 'nothing-selected',
  // Inteactions are selected but not invoked, also when selection changed
  NOT_INVOKED = 'nothing-invoked',
  // Selected interactions are invoked and results should be shown
  INVOKED = 'invoked',
}

export enum TdStateEnum {
  // Either no saved td, or empty td editor
  NO_TD = 'no-td',
  // Valid json td, not yet parsed
  VALID_TD_JSON = 'valid-td-json',
  // Invalid JSON
  INVALID_TD_JSON = 'invalid-json',
  // Successfully consumed TD
  VALID_CONSUMED_TD = 'consumed-td',
  // Empty Td
  INVALID_TD_EMPTY = 'empty-td',
  // Invalid td when consuming
  INVALID_CONSUMED_TD = 'invalid-consumed-td',
  // Td is invalid
  INVALID_TD = 'invalid-td',
  // Td is valid
  VALID_TD = 'valid-td'
}
