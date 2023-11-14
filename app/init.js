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

const $pngCanvas = $('#pngCanvas');

$('#pngButton').on('change', function() {

    if (this.files && this.files[0] && this.files[0].type.match(/^image\//)) {

        let fr = new FileReader();

        fr.onload = function(evt) {

            let pngImage = new Image();

            pngImage.onload = function() {

                $pngCanvas.cropper({
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
                    cropBoxMovable: false,
                    cropBoxResizable: false,
                    toggleDragModeOnDblclick: false,
                });

                let cropper = $pngCanvas.data('cropper');
                cropper.replace(pngImage.src);
            
            }

            pngImage.src = evt.target.result;

        }

        fr.readAsDataURL(this.files[0]);

    } else { 
        $('#pngForm').trigger('reset');
        showToast(false, `No .PNG file choosen!`);
    }
});