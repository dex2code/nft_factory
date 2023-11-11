function logger(severity, message) {

    if (typeof severity !== 'string' || typeof message !== 'string') {
        console.error(`${logPrefix} (${Date.now()}): Wrong logger parameters!`);
    }

    switch (severity) {

        case 'debug':
            if (appDebug === true) {
                console.log(`${logPrefix} (${Date.now()}): ${message}`);
            }
            break;

        case 'info':
            console.info(`${logPrefix} (${Date.now()}): ${message}`);
            break;

        case 'warning':
            console.warn(`${logPrefix} (${Date.now()}): ${message}`);
            break;

        case 'error':
            console.error(`${logPrefix} (${Date.now()}): ${message}`);
            break;

        default:
            console.error(`${logPrefix} (${Date.now()}): Wrong severity parameter!`);

    }
}