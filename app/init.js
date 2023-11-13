let displaySmartContract = appSmartContract.substr(0, 6) + ' ... ' + appSmartContract.substr(appSmartContract.length - 4, appSmartContract.length - 1);
$('#span-smart-contract').text(`SC: ${displaySmartContract}`);
$('#span-smart-contract').prop('title', appSmartContract);

$('#copy-smart-contract').on('click', async function() {
    logger('debug', `Trying to copy text '${appSmartContract}' to clipboard`);

    try {
        await navigator.clipboard.writeText(appSmartContract);
    } catch(err) {
        logger('warning', `Cannot copy text '${appSmartContract}' to clipboard (${err})`);
        showToast(false, 'Error copying to clipboard, check your browser permissions!');

        return;
    }

    logger('debug', `Copied text '${appSmartContract}' to clipboard`);
    showToast(true, 'Copied SC address to clipboard!');
    return;
});
