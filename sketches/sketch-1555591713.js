// https://tonejs.github.io

//var synth = new Tone.Synth().toMaster();

// document.getElementById('consistency').addEventListener('change', (e) => {
//     let note = e.target.value;
//     synth.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), '2n');
// });

// document.getElementById('transparency').addEventListener('change', (e) => {
//     synth.triggerAttackRelease('C4', '2n');
// });

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var gl = fx.canvas();

var started = false;
var button = document.getElementById("start-button");

var audioCtx, analyser, source, stream, bufferLength, dataArray;

button.addEventListener('click', function() {
    audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();

    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

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
});

ctx.fillRect(0, 0, canvas.width, canvas.height);

var frame = 0;

function render() {
    if(started) {
        analyser.getByteFrequencyData(dataArray);

        var image = ctx.getImageData(0, 0, canvas.width, canvas.height);

        var texture = gl.texture(image);
        gl.draw(texture).zoomBlur(256, 0, 0.001).brightnessContrast(0.0, 0.001).update();

        //ctx.clearRect(0, 0, canvas.width, canvas.height);

        //ctx.translate(0, frame % canvas.height);
        for(var i in dataArray) {
            var volume = (dataArray[i]/128)*256;
            ctx.fillStyle = "rgb(" + volume + "," + volume + "," + volume + ")";
            ctx.fillRect(i, 0, 2, 1);
        }

        ctx.putImageData(new ImageData(new Uint8ClampedArray(gl.getPixelArray()), canvas.width, canvas.height), 0, 1);

        frame++;
        }

    requestAnimationFrame(render);
}

requestAnimationFrame(render);


//play a middle 'C' for the duration of an 8th note