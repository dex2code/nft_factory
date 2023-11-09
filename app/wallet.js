function checkWalletIsInstalled() {
    currentTime = new Date();
    console.info(`${logPrefix} (${currentTime.getTime()}): Looking for installed wallet...`);

    if (typeof window.ethereum === 'undefined') {
        console.warn(`${logPrefix} (${currentTime.getTime()}): Wallet is not installed!`);

        $('#btn-connect-wallet').addClass('btn-outline-danger');
        $('#span-connect-wallet').text('Install');
        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(openWalletInstallationPage);

        return false;
    }
    else {
        console.info(`${logPrefix} (${currentTime.getTime()}): Found installed wallet!`);

        $('#btn-connect-wallet').addClass('btn-outline-primary');
        $('#span-connect-wallet').text('Connect');
        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(connectWallet);

        return true;
    }
}


function openWalletInstallationPage() {
    currentTime = new Date();
    console.log(`${logPrefix} (${currentTime.getTime()}): Opening wallet installation page (${walletDownloadURL})`);

    window.open(walletDownloadURL);
    return true;
}


function connectWallet() {
    currentTime = new Date();
    console.info(`${logPrefix} (${currentTime.getTime()}): Connecting wallet...`);

    $('#btn-connect-wallet').removeClass('btn-outline-primary').addClass('btn-outline-success');
    $('#span-connect-wallet').text('0x88....8888');
    $('#btn-connect-wallet').off('click');
    $('#btn-connect-wallet').click(disconnectWallet);

    return true;
}


function disconnectWallet() {
    currentTime = new Date();
    console.info(`${logPrefix} (${currentTime.getTime()}): Disconnecting wallet...`);

    $('#btn-connect-wallet').removeClass('btn-outline-success').addClass('btn-outline-primary');
    $('#span-connect-wallet').text('Connect');
    $('#btn-connect-wallet').off('click');
    $('#btn-connect-wallet').click(connectWallet);

    return true;
}
