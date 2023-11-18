import { NFTStorage } from '../lib/bundle.esm.min.js';
import { Contract, ethers } from '../lib/ethers.min.js';

async function mintMyNFT() {

    if(!activeWalletAccount) {
        showToast(false, 'Connect your wallet first!');
        return false;
    }

    const nftStorageKey = $('#nftStorageKey').val();
    if (!nftStorageKey) {
        showToast(false, 'Please set NFT.Storage API key!');
        return false;
    }

    const nftName = $('#nftName').val();
    if (!nftName) {
        showToast(false, 'Please set Name of your NFT!');
        return false;
    }

    const nftDescription = $('#nftDescription').val();

    const nftBlob = await(
        (
            await fetch(
                cropper.getCroppedCanvas(
                    {
                        width: 350,
                        height: 350,
                        imageSmoothingEnabled: false,
                        imageSmoothingQuality: 'high'
                    }
                ).toDataURL('image/png', 1.0)
            )
        ).blob()
    );

    const myStorage = new NFTStorage( { token: nftStorageKey } );
    const nftObject = {
        name: nftName,
        description: nftDescription,
        image: new File( [ nftBlob ], 'nftFactory.png', { type: 'image/png' } )
    };

    try {

        logger('debug', `Uploading ${JSON.stringify(nftObject)} to IPFS...`);

        $('#minting-spinner').removeClass('visually-hidden');
        $('#nftMint').prop('disabled', true);

        var nftMetadata = await myStorage.store(nftObject);


    } catch (err) {

        logger('error', err);

        $('#minting-spinner').addClass('visually-hidden');
        $('#nftMint').prop('disabled', false);
    
        showToast(false, 'Cannot upload file to NFT.Storage');

        return false;
    }

    let ipfsLink = `${ipfsGateway}${nftMetadata['ipnft']}/metadata.json`;

    logger('info', `Metadata: ${JSON.stringify(nftMetadata)}`);
    logger('info', `IPFS URL for the metadata: ${ipfsLink}`);

    Cookies.set('nftStorageKey', nftStorageKey);

    //$('#minting-spinner').addClass('visually-hidden');
    //$('#nftMint').prop('disabled', false);


    let contractABI;
    let r = await fetch('../contract/NFT_factory.abi.json');

    if (r.ok) {
        contractABI = await r.json();
    } else {
        logger('error', `Cannot load contract ABI (${r.status})`);
        showToast(false, 'Cannot mint NFT (ABI problem)');
        
        return false;
    }
    logger('debug', `Readed contract ABI successfully: ${contractABI}`);


    let provider, signer, contract;
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new Contract(appSmartContract, contractABI, signer);
    } catch (err) {
        logger('error', `Cannot prepare Web3 objects: ${err}`);
        showToast(false, 'Cannot mint NFT (Web3 problem)');
    }
    logger('debug', `Prepared Web3 objects successfully:`);
    logger('debug', `Provider:  ${JSON.stringify(provider)}`);
    logger('debug', `Signer:  ${JSON.stringify(signer)}`);
    logger('debug', `Contract: ${JSON.stringify(contract)}`);


    let tx, rc;
    try {
        tx = await contract.safeMint(activeWalletAccount, ipfsLink);
        rc = await tx.wait();
    } catch(err) {
        logger('error', `TX is broken: ${err}`);
        $('#minting-spinner').addClass('visually-hidden');
        $('#nftMint').prop('disabled', false);
        showToast(false, `SmartContract TX error!`);
        
        return false;
    }

    logger('debug', `TX done: ${JSON.stringify(tx)}`);
    logger('debug', `RC data: ${JSON.stringify(rc)}`);
    logger('debug', `TX Returns: ${rc.logs[1]['data']}`);

    let nftNumber = Number(rc.logs[1]['data']);

    $('#minting-spinner').addClass('visually-hidden');
    $('#nftMint').prop('disabled', false);
    showToast(true, `Minted!`);

    return nftNumber;
}


$('#nftMint').on('click', async function(e) {
    
    e.preventDefault();
    let nftNumber = await mintMyNFT();

    if (nftNumber) {
        await addWalletAsset(String(nftNumber));
    }

});