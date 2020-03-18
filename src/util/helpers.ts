
export function getFormattedJsonString(value: string): string {
    return JSON.stringify(JSON.parse(value), null, 2);
}

export function loggingError(message: any, ...optionalParams: any[]) {
    const isDevMode = process.env.NODE_ENV !== 'production';
    if (isDevMode) {
            // tslint:disable-next-line: no-console
            console.error(message, optionalParams);
    } else {
        return null; // Do nothing, because in production environment
        // TODO think about logging
    }
}

export function isDevelopment(): boolean {
    const isDevMode = process.env.NODE_ENV !== 'production';
    return isDevMode;
}

export const ConfLevel = new Map([
    ['80%', 1.282],
    ['85%', 1.440],
    ['90%', 1.645],
    ['95%', 1.960],
    ['99%', 2.576],
    ['99.5%', 2.807],
    ['99.9%', 3.291]
]);

//   EIGHTY_PERCENT = 1.282,
//   EIGHTY_FIVE_PERCENT = 1.440,
//   NINETY_PERCENT = 1.645,
//   NINETY_FIVE_PERCENT = 1.960,
//   NINETY_NINE_PERCENT = 2.576,
//   NINETY_NINE_POINT_FIVE_PERCENT = 2.807,
//   NINETY_NINE_POINT_NINE_PERCENT = 3.291

export const confidenceLevel = {
    EIGHTY_PERCENT: ['80%', 1.282],
    EIGHTY_FIVE_PERCENT: ['85%', 1.440],
    NINETY_PERCENT: ['90%', 1.645],
    NINETY_FIVE_PERCENT: ['95%', 1.960],
    NINETY_NINE_PERCENT: ['99%', 2.576],
    NINETY_NINE_POINT_FIVE_PERCENT: ['99.5%', 2.807],
    NINETY_NINE_POINT_NINE_PERCENT: ['99.9%', 3.291]
};

export function getCurrentDate() {
    const date = new Date();
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
