export enum interactionType {
    subscribeEvent = "subscribeEvent",
    invokeAction = "invokeAction",
    readProperty = "readProperty",
    writeProperty = "writeProperty",
    observeProperty = "observeProperty"
}
  
export enum interactionTypeOfReceive {
    subscribeEvent = "subscribeEvent",
    invokeAction = "invokeAction",
    readProperty = "readProperty",
    observeProperty = "observeProperty"
}
  
export enum interactionTypeOfSend {
    invokeAction = "invokeAction",
    writeProperty = "writeProperty",
}
  
export  enum structureType {
    interact = "interact",
    loop = "loop",
    wait = "wait",
    case = "case",
    get = "get",
    set = "set",
    ref = "ref"
}
  
export enum loopType {
    timed = "timed",
    logic = "logical"
}
  
export enum interactionDir {
    receive = "receive",
    send = "send"
}

export const singToPlural = {
    function: "functions",
    action: "actions",
    variable: "variables",
    property: "properties"
}

export const typeToOp = {
    subscribe: "subscribeEvent",
    invoke: "invokeAction",
    read: "readProperty",
    write: "writeProperty",
    observe: "observeProperty"
}

export const typeRecToOp = {
    subscribe: "subscribeEvent",
    invoke: "invokeAction",
    read: "readProperty",
    observe: "observeProperty"
}



export const typeSendToOp = {
    invoke: "invokeAction",
    write: "writeProperty"
}

export const typeToTd = {
    subscribeEvent: "events",
    invokeAction: "actions",
    readProperty: "properties",
    writeProperty: "properties",
    observeProperty: "properties"
}

export const structToUml = {
    interact: "group strict",
    loop: "loop",
    wait: "...",
    case: "alt",
    get: "note over",
    set: "note over",
    ref: "ref over"

}

export const recTypeToRet = {
    observe: "confirmation",
    subscribe: "confirmation",
    read: "response",
    invoke: "output"
}

// remove all sd specific properties
export function sdToTd( sd: SDSQ.sdTemplate ) {
    const td = JSON.parse(JSON.stringify(sd))

    delete td.things
    delete td.functions
    delete td.variables
    delete td.path

    if (td.actions) {
        Object.keys(td.actions).forEach( name => {
            delete td.actions[name].path
        })
    }

    if (td.properties) {
        Object.keys(td.properties).forEach( name => {
            delete td.properties[name].path
        })
    }

    return td
}