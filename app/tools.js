async function logger(severity, message) {

    if (typeof severity !== 'string') {
        console.error(`${logPrefix} (${Date.now()}): Wrong severity parameter!`);
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
            break;

    }
}


async function showToast(success, message) {

    $('#toast-body').removeClass('bg-success');
    $('#toast-body').removeClass('bg-danger');

    if (success === true) { $('#toast-body').addClass('bg-success'); }
    else { $('#toast-body').addClass('bg-danger'); }

    $('#toast-text').text(message);

    $('#toast-div').toast('show');

}


function dataURItoBlob(dataURI) {

    let byteString;

    if (dataURI.split(',')[0].indexOf('base64') >= 0) {

        byteString = atob(dataURI.split(',')[1]);

    } else {

        byteString = unescape(dataURI.split(',')[1]);

    }

    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ia = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {

        ia[i] = byteString.charCodeAt(i);

    }

    return new Blob([ia], {type:mimeString});

}
