import { NFTStorage } from '../lib/bundle.esm.min.js';


$('#nftUpload').on('click', async function(e) {

   const nftStorageKey = $('#nftStorageKey').val();
   if (!nftStorageKey) {
    showToast(false, 'Please set NFT.Storage API key!');
    return;
   }

   const nftName = $('#nftName').val();
   if (!nftName) {
    showToast(false, 'Please set Name of your NFT!');
    return;
   }

   const nftDescription = $('#nftDescription').val();

   const nftBlob = await(
    (
        await fetch(
            cropper.getCroppedCanvas({ 
                width: 350,
                height: 350,
                imageSmoothingEnabled: false,
                imageSmoothingQuality: 'high'
            }).toDataURL('image/png', 1.0)
        )
    ).blob());

    const myStorage = new NFTStorage( { token: nftStorageKey } );

    try {

        $('#nftUpload').prop('disabled', true);

        var nftMetadata = await myStorage.store({
            name: nftName,
            description: nftDescription,
            image: new File(
                [ nftBlob ],
                'nftFactory.png',
                { type: 'image/png' }
            )
        });

    } catch (err) {

        logger('error', err);

        $('#nftUpload').prop('disabled', false);
        showToast(false, 'Cannot upload file to NFT.Storage');

        return;
    }

    logger('info', `IPFS URL for the metadata: ${nftMetadata.url}`);

    Cookies.set('nftStorageKey', nftStorageKey);

    $('#nftUpload').prop('disabled', false);
    showToast(true, 'Successfully uploaded to NFT.Storage');
});