async function getWalletAccounts() {
    logger('debug', `(getWalletAccounts) -- Requesting wallet accounts...`);

    let walletAccounts = new Array();

    try {

        walletAccounts = await window.ethereum.request(
            {
                method: 'eth_requestAccounts',
                params: [],
            });

    } catch (err) {

        if (err.code === 4001) {
            logger('warning', `(getWalletAccounts) -- User canceled the connection request (Code: ${err.code})`);
        }
        else {
            logger('warning', `(getWalletAccounts) -- An error occured during the wallet connection (Code: ${err.code})`);
        }

        return null;
    }

    logger('debug', `(getWalletAccounts) -- Received walletAccounts: (${walletAccounts})`);

    return walletAccounts;
}


async function getWalletChainId() {
    logger('debug', `(getWalletChainId) -- Requesting wallet chainId...`);

    let walletChainId = null;

    try {

        walletChainId = await window.ethereum.request(
            {
                method: 'eth_chainId',
                params: [],
            });
    
    } catch (err) {

        logger('warning', `(getWalletChainId) -- Cannot get wallet chainId (Code: ${err.code})`);

        return null;
    }

    logger('debug', `(getWalletChainId) -- Received wallet chainId: (${walletChainId})`);

    return walletChainId;
}


async function checkWalletInstalled() {
    logger('debug', `(checkWalletInstalled) -- Checking the Ethereum wallet is installed...`);

    if (typeof window.ethereum == 'undefined') {
        logger('warning', `(checkWalletInstalled) -- No Ethereum Wallet found`);
        return false;
    } else {
        logger('debug', `(checkWalletInstalled) -- Found installed Ethereum Wallet`);
        return true;
    }
}


async function checkWalletConnected() {
    logger('debug', `(checkWalletConnected) -- Checking the Ethereum provider is connected...`);

    let result = await window.ethereum.isConnected() ? logger('debug', `(checkWalletConnected) -- Ethereum provider is online`) : logger('warning', `(checkWalletConnected) -- Ethereum provider is offline`);

    return result;
}


async function checkWalletChainId() {
    logger('debug', `(checkWalletChainId) -- Checking wallet chainId...`);

    let walletChainId = await getWalletChainId();

    if (walletChainId === null) {
        logger('warning', `(checkWalletChainId) -- No wallet chainId found: (${walletChainId})`);

        disconnectWallet();
        return false;
    }

    if (walletChainId !== appChainId) {
        logger('warning', `(checkWalletChainId) -- User wallet has wrong chainId ${walletChainId} (expected ${appChainId})`);

        return false;
    } else {
        logger('debug', `(checkWalletChainId) -- User wallet has correct chainId (${walletChainId})`);

        return true;
    }
}


async function initWallet() {

    if (await checkWalletInstalled() === true) {

        $('#btn-connect-wallet').addClass('btn-outline-primary');
        $('#span-connect-wallet').text('Connect');
        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(function() { connectWallet(); });

    }
    else {

        $('#btn-connect-wallet').addClass('btn-outline-danger');
        $('#span-connect-wallet').text('Install');
        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(function() { window.open(walletDownloadURL); });

    }

    return;
}


async function connectWallet() {
    logger('debug', `(connectWallet) -- Connecting wallet...`);

    if (await checkWalletConnected() === false) {
        logger('warning', `(connectWallet) -- Cannot connect wallet because Ethereum provider is offline`);
        showToast(false, `Ethereum provider is offline`);

        disconnectWallet();
        return;
    }

    let walletAccounts = await getWalletAccounts();

    if (walletAccounts === null || walletAccounts.length === 0) {
        logger('warning', `(connectWallet) -- No walletAccounts found: (${walletAccounts})`);
        showToast(false, `Please connect your wallet to continue!`);


        disconnectWallet();
        return;
    }

    logger('debug', `(connectWallet) -- Received walletAccounts: (${walletAccounts})`);

    activeWalletAccount = walletAccounts[0];
    displayWalletAccount = activeWalletAccount.substr(0, 4) + ' ... ' + activeWalletAccount.substr(activeWalletAccount.length - 4, activeWalletAccount.length - 1);

    logger('debug', `(connectWallet) -- account ${activeWalletAccount} will be used`);
    
    (await checkWalletChainId()) ? await walletConnected() : await setWalletChainId();

    return;
}


async function setWalletChainId() {
    logger('debug', `(setWalletChainId) -- Setting correct chainId (${appChainId})`);

    try {

        await window.ethereum.request(
            {
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: appChainId }],
            });
    
    } catch (err) {

        if (err.code === 4902) {
            logger('warning', `(setWalletChainId) -- chaiId ${appChainId} is not presented (Code: ${err.code}). Trying to add...`);

            if (await addWalletChainId() === false) {
                disconnectWallet();
                return;
            }
        } else if (err.code === 4001) {
            logger('warning', `(setWalletChainId) -- User cancelled request to change the network: (Code: ${err.code})`);
            showToast(false, `Please switch your wallet to ${appChainName}`);

            disconnectWallet();
            return;
        } else {
            logger('warning', `(setWalletChainId) -- Unknown problem: (Code: ${err.code})`);
            showToast(false, `Cannot switch your wallet to ${appChainName}`);

            disconnectWallet();
            return;
        }

    }

    await walletConnected();

    return;
}


async function addWalletChainId() {
    logger('debug', `(addWalletChainId) -- Adding correct wallet chainId ${appChainId}...`);

    chainDetails = {
        chainId: appChainId,
        chainName: appChainName,
        nativeCurrency: appChainCurrency,
        rpcUrls: [ appChainRPC ],
        blockExplorerUrls: [ appChainExplorer ],
    };

    try {

        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ chainDetails ],
        });
    
    } catch (err) {

        if (err.code === 4001) {
            logger('warning', `(addWalletChainId) -- User cancelled the request (Code: ${err.code})`);
            showToast(false, `Please add network '${appChainName}' to continue.`);
        } else {
            logger('warning', `(addWalletChainId) -- Cannot add chainId with details (${JSON.stringify(chainDetails)}) (Code: ${err.code})`);
            showToast(false, `Cannot add network '${appChainName}'. Check your wallet and try again.`);
        }

        return false;

    }

    logger('debug', `(addWalletChainId) -- Added correct wallet chainId ${appChainId}`);

    return true;
}


async function walletConnected() {
    logger('debug', `(walletConnected) -- Final wallet checking...`);

    let walletAccounts = await getWalletAccounts();
    let walletChainId = await getWalletChainId();

    if (walletAccounts[0] === activeWalletAccount && walletChainId === appChainId) {

        logger('debug', `(walletConnected) -- Wallet is finally connected with account (${walletAccounts[0]} === ${activeWalletAccount}) and correct network (${walletChainId} === ${appChainId})`);
        showToast(true, `Your wallet successfully connected to the app!`);

        $('#btn-connect-wallet').removeClass('btn-outline-primary');
        $('#btn-connect-wallet').removeClass('btn-outline-danger');
        $('#btn-connect-wallet').removeClass('btn-outline-success');
        $('#btn-connect-wallet').addClass('btn-outline-success');

        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(function() { disconnectWallet(true); });

        $('#span-connect-wallet').text(displayWalletAccount);

        $('#nftUpload').attr('disabled', false);

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

    } else {

        logger('warning', `(walletConnected) -- Wallet is not connected because of (${walletAccounts[0]} =?= ${activeWalletAccount}) or (${walletChainId} =?= ${appChainId})`);
        
        if (walletAccounts[0] !== activeWalletAccount) { showToast(false, `Check your wallet account and try again.`); }
        if (walletChainId !== appChainId) { showToast(false, `Check your wallet network and try again.`); }

        disconnectWallet();

    }

    return;
}


async function disconnectWallet(toast = false) {
    logger('debug', `(disconnectWallet) -- Disconnecting wallet...`);
    if (toast === true) { showToast(false, `Wallet disconnected`); }

    activeWalletAccount = null;
    displayWalletAccount = null;

    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);

    $('#btn-connect-wallet').removeClass('btn-outline-success');
    $('#btn-connect-wallet').removeClass('btn-outline-primary');
    $('#btn-connect-wallet').removeClass('btn-outline-danger');
    $('#span-connect-wallet').text('');
    $('#btn-connect-wallet').off('click');

    $('#nftUpload').attr('disabled', true);

    initWallet();

    return;
}


async function handleAccountsChanged(accounts) {
    logger('debug', `(handleAccountsChanged) -- Handling accountsChanged event...`);

    if (accounts.length > 0) {
        disconnectWallet();
        connectWallet();
    } else {
        disconnectWallet(true);
    }

    return;
}


async function handleChainChanged() {
    logger('debug', `(handleChainChanged) -- Handling chainChanged event...`);

    let walletChainId = await getWalletChainId();

    if (walletChainId !== appChainId) {
        logger('warning', `User changed wallet chainId to incorrect value (${appChainId} => ${walletChainId})`);

        disconnectWallet();
        window.location.reload();
    }

    return;
}
