// WDE Music Generator by Halldór Eldjárn (hdor.is)

let started = false;
const startButton = document.getElementById("start-button");
const playButton = document.getElementById("play-button");
const stopButton = document.getElementById("stop-button");

const complexitySlider = document.querySelector("#complexity");
const densitySlider = document.querySelector("#density");
const complexityValue = document.querySelector("#complexity-value");
const densityValue = document.querySelector("#density-value");
const xyPadWrap = document.querySelector(".xy-pad-wrap");
const xyPad = document.querySelector(".xy-pad");
const html = document.querySelector("html");

const ctx = xyPad.getContext('2d');

let T;
let g_contrast = 0, g_mood = 0;
let padPos = { x: 0.5, y: 0.5 };
let density = 0.5;
let complexity = 0.5;
let mood = 0.5;

startButton.addEventListener('click', function() {
    T = setup(Tone);
    document.querySelector('.overlay').remove();

    drawBackground();
    draw();
});

playButton.addEventListener('click', function() {
    Tone.Transport.position = '0:0:0';
    Tone.Transport.cancel();
    
    let song = structure(complexityValue.innerHTML, densityValue.innerHTML);
    schedule(T, song, Tone.Transport);

    T.part.start();
    Tone.Transport.start();
});

stopButton.addEventListener('click', function() {
    T.looper.stopAll();
    T.part.stop();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = '0:0:0';
});

complexitySlider.addEventListener('input', function(e) {
    let value = e.target.value;
    complexityValue.innerHTML = value;

    updateComplexity(value/100, T);
}, false);

densitySlider.addEventListener('input', function(e) {
    let value = e.target.value;
    densityValue.innerHTML = value;

    updateDensity(value/100, T);
}, false);

function updateDensity(value, T) {
    density = value;

    T.delay.wet.rampTo(value*0.25);
    T.delay.feedback.rampTo(value*0.25);
    T.part.probability = 0.5 + value*0.5;
}

function updateComplexity(value, T) {
    complexity = value;

    T.delay.delayTime.value = Tone.TransportTime((Math.floor(complexity * 7) + 1) + "n");
    T.part.loopEnd = ((Math.floor(complexity * 3) + 1)*2 + 'n');
    console.log(complexity)
    console.log((Math.floor(complexity * 7) + 1) + "n");
}

function thumbHandler(e) {
    let x = e.offsetX;
    let y = e.offsetY;
    let w = xyPad.clientWidth;
    let h = xyPad.clientHeight;
    // 24 is 2px border x2 and 20px width/height
    let offsetX = Math.min(Math.max((x - 10), 0), w-20) / w;
    let offsetY = Math.min(Math.max((y - 10), 0), h-20) / h;
}

xyPad.addEventListener('click', thumbHandler);

var mouseDown = false; 

xyPad.addEventListener('mousedown', function(e) {
    mouseDown = true;

    updatePadPos(e.offsetX, e.offsetY, T);
    draw();
});

xyPad.addEventListener('mouseup', function(e) {
    mouseDown = false;
});

xyPad.addEventListener('mousemove', function(e) {
    if(mouseDown) {
        updatePadPos(e.offsetX, e.offsetY, T);
        draw();
    }
});

html.addEventListener('mouseup', function(e) {
    mouseDown = false;
});

window.addEventListener('resize', function(e) {
    draw();
});

function updatePadPos(x, y, T) {
    padPos.x = x / xyPadWrap.getBoundingClientRect().width;
    padPos.y = y / xyPadWrap.getBoundingClientRect().height;
    updateToneWithNormPadPos(padPos.x, padPos.y, T);
}

function updateToneWithNormPadPos(x, y, T) {
    T.reverb.wet.rampTo(y * 0.5);
    T.reverbFm.wet.rampTo(y * 0.5);
    T.fmSynth.harmonicity.rampTo(Math.floor(1 + y * 10)/2)
    T.drumFilter.frequency.rampTo(10000 * (1-y));
}

function draw() {
    let w = xyPadWrap.getBoundingClientRect().width;
    let h = xyPadWrap.getBoundingClientRect().height;
    ctx.canvas.width  = w * 2;
    ctx.canvas.height = h * 2;
    ctx.clearRect(0, 0, xyPad.width, xyPad.height);
    drawBackground();
    ctx.beginPath();
    ctx.arc(padPos.x * w * 2, padPos.y * h * 2, 20, 0, Math.PI*2);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
}

function drawBackground() {
    ctx.fillStyle = "hsl(" + 240 + padPos.x * 90 + ", " + (1-padPos.y) * 100 + "%, " + 50 + "%)";
    ctx.fillRect(0, 0, xyPadWrap.getBoundingClientRect().width * 2, xyPadWrap.getBoundingClientRect().height * 2);
}

const structure = (complexity, density) => {
    let song = {};

    // const intro = (op, dur) => {
    //     return () => {};
    // }

    // see if there is a function that receives op, dur and returns a new function that takes complexity as argument

    song['bass_sub'] =
        ['r:4m', 'p:16m'];
        
    song['bd_sd_chop'] =
        ['p:4m', 'r:16m', 'p:1n'];
        
    song['bd_sd_straight'] =
        ['r:4m', 'p:16m'];
        
    song['intro_arp'] = [];
        
    song['lead'] =
        ['p:4m', 'p:16m', 'p:4m'];
        
    song['perc_add'] = [];

    song['perc_bongo_hihat'] =
        ['r:4m', 'p:16m',];

    if(complexity > 50) {
        song['intro_arp'] = 
            ['p:4m', 'p:16m'];
    } else {
        song['bass_arp'] =
            ['r:4m', 'p:16m'];
    }

    if(complexity < 25 && complexity > 12.5) {
        song['bd_sd_straight'] = ['r:4m', 'r:8m', 'p:8m'];
    } else if(complexity <= 12.5) {
        song['bd_sd_straight'] = [];
        song['bd_sd_chop'] = [];
    }

    if(density > 66) {
        song['perc_add'] =
            ['p:4m', 'p:8m', 'p:8m'];
    } else if(density > 33 && density <= 66) {
        song['perc_add'] =
            ['r:4m', 'r:8m', 'p:8m'];
    } else {
        song['perc_add'] = [];
    }

    if(complexity < 10) {
        song['perc_bongo_hihat'] = [];
    }

    return song;
}

const schedule = (T, structure, Transport) => {
    for(let i in T.files) {
        let voice = T.files[i];
        let loop = T.looper.get(voice);

        let currentTime = 0;

        for(let j in structure[voice]) {
            let pattern = structure[voice][j];

            let op = pattern.split(':')[0];
            let dur = pattern.split(':')[1];

            if(op == 'p') {
                Transport.schedule(function(time) {
                    console.log("should start: ", time);
                    loop.start(time);
                }, currentTime);

                if(voice == 'lead') {
                    Transport.schedule(function(time) {
                        console.log("WILL START PART")
                        T.part.start(0, 0);
                    }, currentTime);
                }

                console.log("start " + voice + " at " + currentTime);
            }

            currentTime = Tone.TransportTime(Tone.Time(currentTime).toSeconds() +
            Tone.Time(dur).toSeconds());

            Transport.schedule(function(time) {
                console.log("should stop: ", time);
                loop.stop(time);
            }, currentTime);

            if(voice == 'lead') {
                Transport.schedule(function(time) {
                    console.log("WILL STOP PART")
                    T.part.stop(0);
                }, currentTime);
            }

            console.log("stop " + voice + " at " + currentTime);
        }
    };
}

const setup = (Tone, playersLoaded) => {
    Tone.Transport.bpm.value = 134;

    var fmSynth = new Tone.FMSynth();
    fmSynth.harmonicity.value = 3.0;

    let arpNotes = ["E3", "B3", "C3", "D3", "G3", "A3", "D4"];
    let currentNote = 0;

    var part = new Tone.Part(function(time, _) {
        let note = Tone.Frequency(arpNotes[currentNote++]);
        if(Math.random() < padPos.x * 0.75 + 0.25) {
            let trans = [12, 24];
            note = note.transpose(trans[Math.floor(padPos.x * trans.length)]);
        }
        fmSynth.triggerAttackRelease(note, "32n", time);
        currentNote %= arpNotes.length;
    } , [0, "F3"]);

    part.loop = true;
    part.loopEnd = "4n";

    part.probability = 0.75;

    var reverb = new Tone.Freeverb(0.85);
    reverb.wet.value = 0.25;

    var reverbFm = new Tone.Freeverb(0.85);
    reverbFm.wet.value = 0.25;

    var delay = new Tone.FeedbackDelay("8n", 0.5);
    delay.wet.value = 0.125;

    var filter = new Tone.AutoFilter("1n", "1m", 3);
    var drumFilter = new Tone.Filter(5000, "lowpass");

    fmSynth.chain(reverbFm, new Tone.Gain(0.15), Tone.Master);

    const files = ['bass_arp', 'bass_sub', 'bd_sd_chop', 'bd_sd_straight',
    'intro_arp', 'lead', 'perc_add', 'perc_bongo_hihat'];

    const urls = {};

    files.forEach(file => {
        urls[file] = 'assets/' + file + '.m4a';
    });

    const looper = new Tone.Players(urls, (looper) => {
        console.log("Players loaded");

        for(var i in files) {
            let file = files[i];
            let player = looper._players[file];

            if(file == 'lead') {
                player.chain(reverb, new Tone.Gain(0.12),  Tone.Master);
            } else if (file == 'bass_sub') {
                player.chain(delay, new Tone.Gain(0.12), Tone.Master);
            } else if (file == 'intro_arp') {
                player.chain(reverb, new Tone.Gain(0.12), Tone.Master);
            } else if (file == 'bd_sd_chop' || file == 'perc_bongo_hihat' || file == 'perc_add' || file == 'bd_sd_straight') {
                player.chain(drumFilter, delay, new Tone.Gain(0.12), Tone.Master);
            } else {
                player.chain(new Tone.Gain(0.12), Tone.Master);
            }
        }

        if(playersLoaded) {
            playersLoaded();
        }

    });

    return {
        looper: looper,
        files: files,
        delay: delay,
        reverb: reverb,
        reverbFm: reverbFm,
        filter: filter,
        part: part,
        fmSynth: fmSynth,
        drumFilter: drumFilter,
    }
}
