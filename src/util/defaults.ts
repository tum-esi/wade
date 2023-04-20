/* the same as in virtual thing EDIT: changed log level */
export const virtualConfigDefault = {
    servient: {
        staticAddress: '127.0.0.1',
        http: {
            port: 80
        }
    },
    log: {
        level: 2
    },
    things: {
        'de:tum:ei:esi:fp:coffee': {
            eventIntervals: {
                maintenance: 15,
                error: 15
            }
        }
    }
};

export const testbenchConfigDefault = {
    SchemaLocation: "Resources/InteractionSchemas/",
    TestReportsLocation: "Reports/",
    TestDataLocation: "Resources/fake-data.json",
    TimeBetweenRequests: 500,
    ActionTimeout: 4000,
    Scenarios: 2,
    Repetitions: 1,
    EventAndObservePOptions: {
        Asynchronous: {
            MaxAmountRecvData: 2,
            MsListen: 400,
            MsSubscribeTimeout: 400
        },
        Synchronous: {
            isEnabled: true,
            MaxAmountRecvData: 5,
            MsListen: 5000,
            MsSubscribeTimeout: 1000
        }
    },
    credentials: {}
};