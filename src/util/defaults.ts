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
