export enum ElementTypeEnum {
  FOLDER = 'folder',
  TD = 'td',
  MASHUP = 'mashup'
}

/**
 * Available Tabs for Thing Description elements
 */
export enum TDTabsEnum {
  EDITOR = 'editor',
  CONFIG = 'config',
  PERFORMANCE = 'performance'
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
  VALID_TD = 'VALID TD: TD is valid.',
  TD_FETCHING = 'FETCHING TD...'
}

export enum TdConfigEnum {
  INFO = 'This config will be used for your TD.',
  UNSAVED = 'Please save your changes to apply them',
  SAVE_SUCCESS = 'Config was safed successfully.',
  RESET = 'Config was resetted to default config. Click save to apply this.',
  ERROR = 'Error: Wrong data format. Change config to make it saveable.'
}

/* The enum values indexes of SAVE_SUCCESS and ERROR must be equal
 to the indexes at the TdConfigEnum, to ensure that aConfigStatusBar
 highliting works */
export enum TdVirtualConfigEnum {
  INFO = 'This config will be used to generate a Virtual Thing for your TD',
  UNSAVED = 'Please save your changes to apply them',
  SAVE_SUCCESS = 'Virtual Thing config was safed successfully.',
  RESET = 'Virtual Thing config was resetted to default config. Save to apply!',
  ERROR = 'Error: Wrong data format. Change Virtual Thing config to make it saveable.'
}

export enum ProtocolEnum {
  HTTP = 'http',
  HTTPS = 'https',
  COAP = 'coap',
  COAPS = 'coaps',
  MQTT = 'mqtt'
}

export enum VtStatus {
  NOT_CREATED = 'Virtual Thing is not running for this TD',
  STARTUP = 'a Virtual Thing is currently being created',
  RUNNING = 'Virtual Thing is up',
  STOPPED = 'the virtualization is being stopped',
  ERROR = 'there has been an error with Virtual Thing'
}

export enum MeasurementTypeEnum {
  NUM_RUNS = 'Iteration',
  DURATION_RUN = 'Duration',
  NUM_CLIENTS_NUM_RUN = 'Multiple Clients with iterations',
  NUM_CLIENTS_DURATION_RUN = 'Multiple Clients with duration',
}

export enum DelayTypeEnum {
  NO_DELAY = 'No Delay',
  BEFORE_EACH = 'Delay before each',
  BEFORE_BEGIN = 'Delay before beginning'
}

export enum StatusEnum {
  NOT_STARTED = 'not-started',
  LOADING = 'loading',
  COMPUTED = 'computed',
  ERROR = 'error'
}

// For InteractionTiming vocabulary
export enum TypeOfMeasurementContext {
  DYNAMIC_PROPERTY_READ = 'dynamicTimingContext_property_read',
  DYNAMIC_PROPERTY_WRITE = 'dynamicTimingContext_property_write',
  DYNAMIC_ACTION = 'dynamicTimingContext_action',
  NULL = 'null'
}
