///////////////////////////// 
// Global constants
///////////////////////////// 

const startButton = document.getElementById("start-button");

const html = document.querySelector("html");

const yearEl = document.querySelector("#year");
const monthEl = document.querySelector("#month");
const dayEl = document.querySelector("#day");
const hourEl = document.querySelector("#hour");
const minuteEl = document.querySelector("#minute");
const secondEl = document.querySelector("#second");

let T;
let started = false;
let density = 0.5;
let complexity = 0.5;

///////////////////////////// 
// Listeners setup
///////////////////////////// 

startButton.addEventListener('click', function() {
    T = setup(Tone);
    document.querySelector('.overlay').remove();

    Tone.Transport.start();
    T.start();

    updateClock();

    setInterval(updateClock, 1000);
});



function updateClock() {
    yearEl.innerHTML = "2";

    var date = new Date();

    yearEl.innerHTML = date.getYear() + 1900;
    monthEl.innerHTML = date.getMonth() + 1;
    dayEl.innerHTML = date.getDay();
    hourEl.innerHTML = date.getHours();
    minuteEl.innerHTML = date.getMinutes();
    secondEl.innerHTML = date.getSeconds();
}

///////////////////////////// 
// TONE.js
///////////////////////////// 

const setup = (Tone, playersLoaded) => {
    Tone.Transport.bpm.value = 60;
    let harm = new TimeHarmony();

    /////////////////////
    // LEAD FM REVERB SYNTH
    /////////////////////

    var fmSynth = new Tone.FMSynth();
    var reverb = new Tone.Freeverb(0.96);

    fmSynth.harmonicity.value = 0.992;
    reverb.wet.value = 0.7;
    fmSynth.chain(reverb, new Tone.Gain(0.15), Tone.Master);

    let arpNotes = ["E3", "B3", "C3", "D3", "G3", "A3", "D4"];
    let currentNote = 0;

    var leadPart = new Tone.Part(function(time, _) {
        let note = Tone.Frequency(arpNotes[currentNote++]);
        if(Math.random() < complexity/100 * 0.75 + 0.25) {
            let trans = [12, 24];
            note = note.transpose(trans[Math.floor(density/100 * trans.length)]);
        }
        fmSynth.triggerAttackRelease(note, "32n", time);
        currentNote %= arpNotes.length;
    } , [0, "F3"]);

    leadPart.loop = true;
    leadPart.loopEnd = "4n";
    leadPart.probability = 0.75;

    /////////////////////
    // BASS
    /////////////////////

    var bassSynth = new Tone.MonoSynth({
        "oscillator" : {
            "type" : "triangle",
        },
        "envelope" : {
            "attack" : 0.1,
        },
        "filter" : {
            "frequency" : 100,
        },
        "filterEnvelope" : {
            "baseFrequency" : 200,
        }
    });

    bassSynth.volume = -20;
    bassSynth.chain(Tone.Master);

    var bassPart = new Tone.Part(function(time, _) {
        let note = Tone.Frequency(arpNotes[currentNote++]);
        bassSynth.triggerAttackRelease(harm.getNextBassNote(), "16n", time);
    } , [0, "F0"]);

    bassPart.loop = true;
    bassPart.loopEnd = "4n";
    bassPart.probability = 0.5;

    return {
        fmSynth: fmSynth,
        reverb: reverb,
        start: function() {
            leadPart.start();
            bassPart.start();
        },
        stop: function() {
            leadPart.stop();
            bassPart.stop();
        },
    }
}

function TimeHarmony() {
    let activeChord = [];

    const getNextBassNote = () => {
        return "F1";
    };

    return {
        getNextBassNote: getNextBassNote,
    }
}