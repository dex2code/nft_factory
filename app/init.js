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


$('#link-smart-contract').on('click', function() { window.open(`${appChainExplorer}/address/${appSmartContract}`) } );


const $imgCanvas = $('#imgCanvas');

$imgCanvas.cropper({
    viewMode: 3,
    aspectRatio: 1 / 1,
    dragMode: 'move',
    autoCrop: true,
    autoCropArea: 1.0,
    restore: false,
    guides: true,
    modal: false,
    center: true,
    highlight: true,
    cropBoxMovable: true,
    cropBoxResizable: false,
    toggleDragModeOnDblclick: false,
});

var cropper = $imgCanvas.data('cropper');


$('#imgUploadButton').on('change', function() {

    if (this.files && this.files[0] && this.files[0].type.match(/^image\//)) {

        let fr = new FileReader();

        fr.onload = function(evt) {

            let nftImage = new Image();

            nftImage.onload = function() {
                cropper.replace(nftImage.src);
            }
            nftImage.src = evt.target.result;
        }
        fr.readAsDataURL(this.files[0]);

    } else { 

        $('#imgForm').trigger('reset');
        showToast(false, `No Image file choosen!`);

    }
});


if (typeof Cookies.get('nftStorageKey') == 'undefined') {

    $('#nftStorageKey').text(nftStorageKey);

} else {

    $('#nftStorageKey').text(Cookies.get('nftStorageKey'));

}
