// https://tonejs.github.io

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var started = false;
var button = document.getElementById("start-button");

button.addEventListener('click', function() {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {

            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.');
        var constraints = { audio: true }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(
                function(stream) {
                    source = audioCtx.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.connect(audioCtx.destination);
                    started = true;
                })
            .catch(function(err) { console.log('The following gUM error occured: ' + err); })
    } else {
        console.log('getUserMedia not supported on your browser!');
    }
    requestAnimationFrame(render);
});


const ToneWrapper = (Tone) => {
    Tone.
}

function render() {
    if(started) {
        // Do canvas rendering stuff here
    }

    requestAnimationFrame(render);
}
