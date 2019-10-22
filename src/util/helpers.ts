
export function getFormattedJsonString(value: string): string {
    return JSON.stringify(JSON.parse(value), null, 2);
}

export function loggingInfo(message: any, ...optionalParams: any[]) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
            // tslint:disable-next-line: no-console
            console.log(message, optionalParams);
    } else {
        return null; // Do nothing, because in production environment
        // TODO think about logging
    }
}

export function loggingError(message: any, ...optionalParams: any[]) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
            // tslint:disable-next-line: no-console
            console.error(message, optionalParams);
    } else {
        return null; // Do nothing, because in production environment
        // TODO think about logging
    }
}
