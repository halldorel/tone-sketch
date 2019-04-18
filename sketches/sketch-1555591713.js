// https://tonejs.github.io

var synth = new Tone.Synth().toMaster()

document.getElementById('consistency').addEventListener('change', (e) => {
    let note = e.target.value;
    synth.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), '2n');
});

document.getElementById('transparency').addEventListener('change', (e) => {
    synth.triggerAttackRelease('C4', '2n');
});

//play a middle 'C' for the duration of an 8th note