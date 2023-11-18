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
    let r = await fetch('contract/NFT_factory.abi.json');

    if (r.ok) {
        contractABI = await r.json();
    } else {
        logger('error', `Cannot load contract ABI (${r.status})`);
        showToast(false, 'Cannot mint NFT (ABI problem)');

        $('#minting-spinner').addClass('visually-hidden');
        $('#nftMint').prop('disabled', false);
        
        return false;
    }
    logger('debug', `Readed contract ABI successfully`);


    let provider, signer, contract;
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new Contract(appSmartContract, contractABI, signer);
    } catch (err) {
        logger('error', `Cannot prepare Web3 objects: ${err}`);
        showToast(false, 'Cannot mint NFT (Web3 problem)');

        $('#minting-spinner').addClass('visually-hidden');
        $('#nftMint').prop('disabled', false);

        return false;
    }
    logger('debug', `Prepared Web3 objects successfully.`);
    logger('debug', `Signer:  ${JSON.stringify(signer)}`);


    let tx, rc;
    try {
        tx = await contract.safeMint(activeWalletAccount, ipfsLink);
        rc = await tx.wait();
    } catch(err) {
        logger('error', `TX is broken: ${err}`);
        showToast(false, `SmartContract TX error!`);

        $('#minting-spinner').addClass('visually-hidden');
        $('#nftMint').prop('disabled', false);
        
        return false;
    }

    logger('debug', `TX Returns: ${rc.logs[1]['data']}`);
    showToast(true, `Minted!`);

    $('#minting-spinner').addClass('visually-hidden');
    $('#nftMint').prop('disabled', false);

    let txNumber = tx.hash;
    let nftNumber = Number(rc.logs[1]['data']);

    return {
        nftId: nftNumber,
        txId: txNumber
    }
}


$('#nftMint').on('click', async function(e) {
    
    e.preventDefault();

    let mintedNFT = await mintMyNFT();

    if (mintedNFT !== false) {

        $('#modalWindowHead').text(`NFT Factory #${mintedNFT['nftId']}`);
        $('#modalWindowBody').html(`
            Your NFT has been successfully minted!<br /><br />
            If your wallet doesn't support auto-discovery option, you can add it manually using the smartcontract address and token ID: <b>${mintedNFT['nftId']}</b><br /><br />
            You can also find your NFT here: <a href="${appChainExplorer}/nft/${appSmartContract}/${mintedNFT['nftId']}" target="_blank">Explorer</a>
        `);
    
        $('#modalWindowDiv').modal('show');

        
        $('#imgForm').get(0).reset();

        await cropper.replace(cropper.originalUrl);

        $('#nftName').val('');
        $('#nftDescription').val('');

        await addWalletAsset(String(mintedNFT['nftId']));

    }
});