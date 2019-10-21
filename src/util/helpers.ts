
export function getFormattedJsonString(value: string): string {
    return JSON.stringify(JSON.parse(value), null, 2);
}

export function loggingDebug(message: any, ...optionalParams: any[]) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
            // tslint:disable-next-line: no-console
            console.log(message, optionalParams);
    } else {
        return null; // Do nothing, because in production environment
    }
}
