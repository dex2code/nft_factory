async function checkWalletConnected() {
    logger('debug', `Checking the Ethereum provider is connected...`);

    let result = await window.ethereum.isConnected();

    if (result === true) { logger('debug', `Ethereum provider is online (${result})`); }
    else { logger('warning', `Ethereum provider is offline (${result})`); }

    return result;
}


async function checkWalletIsInstalled() {
    logger('debug', `Looking for installed wallet...`);

    if (typeof window.ethereum != 'undefined') {

        let walletType = (window.ethereum.isMetaMask) ? 'metamask' : 'ethereum-compatible';
        logger('debug', `Found installed wallet (${walletType})`);

        $('#btn-connect-wallet').addClass('btn-outline-primary');
        $('#span-connect-wallet').text('Connect');
        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(connectWallet);

    }
    else {

        logger('warning', `Wallet is not installed`);

        $('#btn-connect-wallet').addClass('btn-outline-danger');
        $('#span-connect-wallet').text('Install');
        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(openWalletInstallationPage);

    }

    return;
}


async function openWalletInstallationPage() {
    logger('debug', `Opening wallet installation page (${walletDownloadURL})...`);

    window.open(walletDownloadURL);
    return;
}


async function connectWallet() {
    logger('debug', `Connecting wallet...`);

    if (await checkWalletConnected() === false) {
        logger('warning', `Cannot connect wallet because Ethereum provider is offline`);

        disconnectWallet();
        return;
    }

    let walletAccounts = await getWalletAccounts();

    if (walletAccounts === null || walletAccounts.length === 0) {
        logger('warning', `No walletAccounts found: (${walletAccounts})`);

        disconnectWallet();
        return;
    }

    logger('debug', `Received walletAccounts: (${walletAccounts})`);

    if (activeWalletAccount !== walletAccounts[0]) {
        logger('debug', `Connecting account ${walletAccounts[0]}...`);

        activeWalletAccount = walletAccounts[0];
        displayWalletAccount = activeWalletAccount.substr(0, 4) + ' ... ' + activeWalletAccount.substr(activeWalletAccount.length - 4, activeWalletAccount.length - 1);

        $('#btn-connect-wallet').removeClass('btn-outline-primary').addClass('btn-outline-success');
        $('#span-connect-wallet').text(displayWalletAccount);
        $('#btn-connect-wallet').off('click');
        $('#btn-connect-wallet').click(disconnectWallet);
    }

    logger('debug', `Connected account ${activeWalletAccount}`);
    
    if (await checkWalletChainId() === true) {
        walletConnected();
    } else {
        await setWalletChainId();
    }

    return;
}


async function setWalletChainId() {
    logger('debug', `Setting correct chainId (${appChainId})`);

    try {

        await window.ethereum.request(
            {
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: appChainId }],
            });
    
    } catch (err) {

        if (err.code === 4902) {
            logger('warning', `chaiId ${appChainId} is not presented (Code: ${err.code}). Trying to add...`);

            if (await addWalletChainId() === false) {
                disconnectWallet();
                return;
            }
        } else {
            logger('warning', `Cannot set correct chainId: (Code: ${err.code})`);

            disconnectWallet();
            return;
        }

    }

    walletConnected();

    return;
}


async function addWalletChainId() {
    logger('debug', `Adding correct wallet chainId ${appChainId}...`);

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
            logger('warning', `User cancelled the request (Code: ${err.code})`);    
        } else {
            logger('warning', `Cannot add chainId with details (${JSON.stringify(chainDetails)}) (Code: ${err.code})`);
        }

        return false;

    }

    logger('debug', `Added correct wallet chainId ${appChainId}`);

    return true;
}


async function walletConnected() {
    logger('debug', `Final wallet checking...`);

    let walletAccounts = await getWalletAccounts();
    let walletChainId = await getWalletChainId();

    if (walletAccounts[0] === activeWalletAccount && walletChainId === appChainId) {
        logger('debug', `Wallet is finally connected with account (${walletAccounts[0]} === ${activeWalletAccount}) and (${walletChainId} === ${appChainId})`);

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleWalletDisconnected);
    } else {
        logger('warning', `Wallet is not connected because of (${walletAccounts[0]} =?= ${activeWalletAccount}) or (${walletChainId} =?= ${appChainId})`);

        disconnectWallet();
    }

    return;
}


async function disconnectWallet() {
    logger('debug', `Disconnecting wallet...`);

    activeWalletAccount = null;
    displayWalletAccount = null;

    $('#btn-connect-wallet').removeClass('btn-outline-success').addClass('btn-outline-primary');
    $('#span-connect-wallet').text('Connect');
    $('#btn-connect-wallet').off('click');
    $('#btn-connect-wallet').click(connectWallet);

    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
    window.ethereum.removeListener('disconnect', handleWalletDisconnected);

    return;
}


async function getWalletAccounts() {
    logger('debug', `Requesting wallet accounts...`);

    let walletAccounts = new Array();

    try {

        walletAccounts = await window.ethereum.request(
            {
                method: 'eth_requestAccounts',
                params: [],
            });

    } catch (err) {

        if (err.code === 4001) { logger('warning', `User canceled the connection request (Code: ${err.code})`); } 
        else { logger('warning', `An error occured during the wallet connection (Code: ${err.code})`); }

        return null;
    }

    logger('debug', `Received walletAccounts: (${walletAccounts})`);

    return walletAccounts;
}


async function getWalletChainId() {
    logger('debug', `Requesting wallet chainId...`);

    let walletChainId = null;

    try {

        walletChainId = await window.ethereum.request(
            {
                method: 'eth_chainId',
                params: [],
            });
    
    } catch (err) {

        logger('warning', `Cannot get wallet chainId (Code: ${err.code})`);

        return null;
    }

    logger('debug', `Received wallet chainId: (${walletChainId})`);

    return walletChainId;
}


async function checkWalletChainId() {
    logger('debug', `Checking wallet chainId...`);

    let walletChainId = await getWalletChainId();

    if (walletChainId === null) {
        logger('warning', `No wallet chainId found: (${walletChainId})`);

        disconnectWallet();
        return false;
    }

    if (walletChainId !== appChainId) {
        logger('warning', `User wallet has wrong chainId ${walletChainId} (expected ${appChainId})`);

        return false;
    } else {
        logger('debug', `User wallet has correct chainId (${walletChainId})`);

        return true;
    }
}


async function handleAccountsChanged() {
    logger('debug', `Handling accountsChanged event...`);

    disconnectWallet();

    return;
}


async function handleChainChanged() {
    logger('debug', `Handling chainChanged event...`);

    let walletChainId = await getWalletChainId();

    if (walletChainId !== appChainId) {
        logger('warning', `User changed wallet chainId to incorrect value (${appChainId} => ${walletChainId})`);

        disconnectWallet();
    }

    return;
}


async function handleWalletDisconnected() {
    logger('warning', `Ethereum provider disconnected!`);

    disconnectWallet();

    return;
}