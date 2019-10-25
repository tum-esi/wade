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
  PROP_OBSERVE_READ = 'property-observe-read',
  PROP_OBSERVE_WRITE = 'property-observe-write',
  ACTION = 'action-invoke',
  EVENT_SUB = 'event-subscribe',
  EVENT_UNSUB = 'event-unsubscribe'
}

export enum InteractionStateEnum {
  // No / invalid td
  NO_INTERACTIONS = 'No interactions can be shown.',
  NOT_SELECTED = 'Select an interaction to invoke it.',
  NOT_INVOKED = 'Interactions are selected. Click invoke button to invoke them.',
  INVOKED = 'Interactions have been invoked.'
}

// Results messages
export enum RESULT_MESSAGES {
  NO_INTERACTIONS_SELECTED = 'No interactions have been selected',
  NO_INTERACTIONS_INVOKED = 'Interactions have not been invoked yet'
}

export enum TdStateEnum {
  NO_TD = 'NO TD: Paste or upload a Thing Description.',
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

export enum TdConfigEnum {
  INFO = 'This config will be used for your TD.',
  UNSAVED = 'Please save your changes to apply them',
  SAVE_SUCCESS = 'Config was safed successfully.',
  RESET = 'Config was resetted to default config. Click save to apply this.',
  ERROR = 'Error: Wrong data format. Change config to make it saveable.'
}

export enum ProtocolEnum {
  HTTP = 'http',
  HTTPS = 'https',
  COAP = 'coap',
  COAPS = 'coaps',
  MQTT = 'mqtt'
}

export enum MeasurementTypeEnum {
  NUM_RUNS = 'num-runs',
  DURATION_RUN = 'duration-run',
  NUM_CLIENTS_NUM_RUN = 'num-clients-num-run',
  NUM_CLIENTS_DURATION_RUN = 'num-clients-duration-run',
}
