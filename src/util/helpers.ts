
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
