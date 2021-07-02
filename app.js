var midi = null;
var context = null;

var synthesizer = null;

var filterLFO = null;
var filterLFOGain = null;
var filter = null;

var effectsGain = null;

var distortion = null;
var distortionAmount = 0.0;

var delay = null;
var delayGain = null;
var delayGainValue = 0.0;
var delayFeedbackTime = 0.0;

var reverb = null;
var reverbGain = null;
var impulseResponses = [];
const filepathIRs = "IRs/"

var modulators = [];

var masterGain = null;

var midiOut = null;

var sequence = [];
let sequenceID = -1;
var seqLastID = sequenceID;
var sequenceSpeed = 300;
var timeOut = null;

var seqMode = false;
var seqRunning = false;
var seqRandom = false;

var sequenceModeSelect = null;
var sequenceHold = null;
var sequenceClear = null;

var midiNumberOffset = 24;
var midiNoteNumbers = makeMIDITable();
console.log(midiNoteNumbers);

function onMIDIFailure(msg) {
    console.log("MIDI Access Failed! - " + msg);
}

$(document).ready(function () {
    // -------------Synth Knobs----------------
    $(".synthKnob").roundSlider({
        sliderType: "default",
        circleShape: "pie",
        radius: 30,
        width: 7,
        lineCap: "round",
        handleSize: "+5",
        showTooltip: false,
        mouseScrollAction: true
    });

    $("#portamentoSlider").roundSlider({
        radius: 20,
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        change: function (slider) {
            synthesizer.setPortamento(slider.value);
        }
    });

    $("#attackSlider").roundSlider({
        value: 0.0,
        min: 0.0,
        max: 20.0,
        step: 0.01,
        change: function (slider) {
            synthesizer.setAttack(slider.value);
        }
    });

    $("#decayGainSlider").roundSlider({
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        change: function (slider) {
            synthesizer.setDecayGain(slider.value);
        }
    });

    $("#decayTimeSlider").roundSlider({
        value: 0.3,
        min: 0.0,
        max: 2.0,
        step: 0.01,
        change: function (slider) {
            synthesizer.setDecayTime(slider.value);
        }
    });

    $("#sustainGainSlider").roundSlider({
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        change: function (slider) {
            synthesizer.setSustainGain(slider.value);
        }
    });

    $("#releaseSlider").roundSlider({
        value: 0.01,
        min: 0.0,
        max: 2.0,
        step: 0.01,
        change: function (slider) {
            synthesizer.setRelease(slider.value);
        }
    });

    // -------------Filter Knobs----------------
    $(".filterKnob").roundSlider({
        sliderType: "default",
        circleShape: "pie",
        startAngle: 180,
        radius: 50,
        width: 7,
        lineCap: "round",
        handleSize: "+5",
        showTooltip: false,
        mouseScrollAction: true
    })

    $("#filterFreqSlider").roundSlider({
        value: 1,
        min: 1,
        max: 5000,
        step: 1,
        update: function (slider) {
            filter.frequency.value = slider.value;
        }
    });

    $("#filterQSlider").roundSlider({
        value: 0.01,
        min: 0.0,
        max: 50,
        step: 0.001,
        update: function (slider) {
            filter.Q.value = slider.value;
        }
    });

    // -------------FilterLFO Knobs----------------
    $("#filterLFOSpeedSlider").roundSlider({
        value: 10,
        min: 0,
        max: 100,
        step: 1,
        update: function (slider) {
            filterLFO.frequency.value = slider.value;
        }
    });

    $("#filterLFOGainSlider").roundSlider({
        value: 10,
        min: 0,
        max: 1000,
        step: 1,
        update: function (slider) {
            filterLFOGain.gain.value = slider.value;
        }
    });

    // -------------Drive Knobs----------------
    $(".effectsKnob").roundSlider({
        sliderType: "default",
        circleShape: "pie",
        startAngle: 315,
        radius: 30,
        width: 7,
        lineCap: "round",
        handleSize: "+5",
        showTooltip: false,
        mouseScrollAction: true
    });

    $("#driveGainSlider").roundSlider({
        startAngle: 135,
        radius: 50,
        value: 0.0,
        min: 0.0,
        max: 400,
        step: 1,
        update: function (slider) {
            distortion.curve = makeDistortionCurve(slider.value)
        }
    });

    // -------------Delay Knobs----------------
    $("#delayTimeKnob").roundSlider({
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        update: function (slider) {
            delay.delayTime.value = slider.value;
        }
    });

    $("#delayFBTimeKnob").roundSlider({
        value: 0.0,
        min: 0.0,
        max: 30.0,
        step: 0.01,
        update: function (slider) {
            delayFeedbackTime = slider.value;
        }
    });

    $("#delayGainKnob").roundSlider({
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.1,
        update: function (slider) {
            delayGainValue = slider.value;
        }
    });

    // -------------Reverb Knob----------------
    $("#reverbKnob").roundSlider({
        radius: 50,
        startAngle: 135,
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        update: function (slider) {
            reverbGain.gain.value = slider.value;
        }
    });

    // -------------Mod Knobs----------------
    $(".modFreqKnob").roundSlider({
        sliderType: "default",
        circleShape: "half-top",
        startAngle: 315,
        radius: 50,
        width: 7,
        lineCap: "round",
        handleSize: "+5",
        showTooltip: true,
        mouseScrollAction: true,
        value: 0.0,
        min: 0.0,
        max: 1000.0,
        step: 0.01,
        update: function (slider) {
            var modIndex = slider.id[slider.id.length - 1];
            modulators[modIndex - 1][0].frequency.value = slider.value;
        }
    });

    $(".modGainKnob").roundSlider({
        sliderType: "default",
        circleShape: "half-top",
        startAngle: 315,
        radius: 50,
        width: 7,
        lineCap: "round",
        handleSize: "+5",
        showTooltip: true,
        mouseScrollAction: true,
        value: 0.0,
        min: 0.0,
        max: 100.0,
        step: 0.01,
        update: function (slider) {
            var modIndex = slider.id[slider.id.length - 1];
            modulators[modIndex - 1][1].gain.value = slider.value;
        }
    });

    // -------------Sequencer Knobs----------------
    $("#sequenceSpeed").roundSlider({
        sliderType: "default",
        circleShape: "pie",
        startAngle: 315,
        radius: 40,
        width: 7,
        lineCap: "round",
        handleSize: "+5",
        showTooltip: true,
        mouseScrollAction: true,
        value: 0.0,
        min: 0,
        max: 1000,
        step: 1,
        update: function (slider) {
            sequenceSpeed = slider.value;
        }
    });

    // -------------MasterGain Knobs----------------
    $("#masterGainSlider").roundSlider({
        sliderType: "default",
        circleShape: "pie",
        startAngle: 315,
        radius: 80,
        width: 15,
        lineCap: "round",
        handleSize: "+5",
        showTooltip: false,
        mouseScrollAction: true,
        value: 0.0,
        min: 0,
        max: 1,
        step: 0.01,
        update: function (slider) {
            console.log("Tssss");
            masterGain.gain.value = slider.value;
        }
    });

});

window.onload = function () {
    // Get Access to MIDI Devices
    if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then(onMIDIInit, onMIDIFailure);
    else
        alert("No MIDI support present in your browser.  You're gonna have a bad time.");

    // Create the AudioContext
    context = new AudioContext();

    // Create MasterGain
    masterGain = new GainNode(context);
    masterGain.gain.value = 0.5;

    // Create Filter
    filter = new BiquadFilterNode(context);
    filter.type = "lowpass";
    filter.frequency.value = 5000;
    filter.gain.value = 25;

    // Create the Polyphonic Synth
    synthesizer = new Synth(context, filter, midi, 12, "sine");

    // Create the FilterLFO
    filterLFO = new OscillatorNode(context);
    filterLFO.frequency.value = 10;

    filterLFOGain = new GainNode(context);
    filterLFOGain.gain.value = 50;

    filterLFO.connect(filterLFOGain);
    filterLFOGain.connect(filter.frequency);

    filterLFO.start();

    // Create EffectsGain
    effectsGain = new GainNode(context);
    effectsGain.value = 0.5;

    effectsGain.connect(masterGain);

    // Create Distortion
    distortion = new WaveShaperNode(context);
    distortion.curve = makeDistortionCurve(distortionAmount);
    distortion.oversample = "4x";

    filter.connect(distortion);
    distortion.connect(effectsGain);

    // Create Delay
    delay = new DelayNode(context);
    delay.delayTime.value = 0.0;

    delayGain = new GainNode(context);
    delayGain.gain.value = 0.5;

    distortion.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay);
    delayGain.connect(effectsGain);

    // Create Reverb
    reverb = new ConvolverNode(context);

    reverbGain = new GainNode(context);
    reverbGain.gain.value = 0.0;

    // Load Reverb IRs
    var irFilenames = ['5UnderpassValencia.wav', 'EchoBridge.wav', 'HopkinsDriveUnderpass.wav'];

    irFilenames.forEach(function (filename) {
        console.log(filename);
        var request = new XMLHttpRequest();
        request.open('GET', "IRs/" + filename, true);
        request.responseType = "arraybuffer";

        request.onload = function () {
            context.decodeAudioData(request.response, function (buffer) {
                impulseResponses.push(buffer);
            });

            reverb.buffer = impulseResponses[0];
        };

        request.send();
    });

    effectsGain.connect(reverb);
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);
    masterGain.connect(context.destination);

    // Create Modulators
    for (var i = 1; i < 6; i++) {
        var mod = new OscillatorNode(context);
        mod.type = 'sine';
        mod.frequency.value = 3;

        var modGain = new GainNode(context);
        modGain.gain.value = 50;

        mod.connect(modGain);

        // modulators [oscillator, gain, keyPress]
        modulators.push([mod, modGain, false]);

        mod.start();

        // Read the Mod-Selects
        var selectID = "modSelect" + i;
        var modTypeSelect = document.getElementById("modTypeSelect" + i);
        var modDestSelect = document.getElementById(selectID);

        // Change the Mod-Oscillator Type
        modTypeSelect.onchange = function (event) {
            var modIndex = event.target.id[event.target.id.length - 1];
            var newOsc = new OscillatorNode(context);
            var oldOsc = modulators[modIndex - 1][0];

            newOsc.type = document.getElementById(event.target.id).value;
            newOsc.frequency.value = oldOsc.frequency.value;

            oldOsc.disconnect();

            newOsc.connect(modulators[modIndex - 1][1]);
            newOsc.start();
            modulators[modIndex - 1][0] = newOsc;
        }

        // Define how the connections work
        modDestSelect.onchange = function (event) {
            var modIndex = event.target.id[event.target.id.length - 1];
            var modulatorGain = modulators[modIndex - 1][1];

            modulatorGain.disconnect();

            var selectedOption = document.getElementById(event.target.id).value;

            switch (selectedOption) {
                case 'none':
                    //modulators[modIndex-1][1].disconnect();
                    break;
                case 'oscDetune':
                    synthesizer.connectToDetune(modulatorGain);
                    break;
                case 'oscGain':
                    synthesizer.connectToGain(modulatorGain);
                    break;
                case 'filterLFOSpeed':
                    modulatorGain.connect(filterLFO.frequency);
                    break;
                case 'filterLFOGain':
                    modulatorGain.connect(filterLFOGain.gain);
                    break;
                case 'filterFreq':
                    modulatorGain.connect(filter.frequency);
                    break;
                case 'filterQ':
                    modulatorGain.connect(filter.Q);
                    break;
                case 'delayTime':
                    modulatorGain.connect(delay.delayTime);
                    break;
                case 'reverb':
                    modulatorGain.connect(reverbGain.gain);
                    break;
            }

            if (selectedOption.includes('modGain')) {
                var index = selectedOption[selectedOption.length - 1] - 1;
                modulatorGain.connect(modulators[index][1].gain);
            }

            if (selectedOption.includes('modFreq')) {
                var index = selectedOption[selectedOption.length - 1] - 1;
                modulatorGain.connect(modulators[index][0].frequency);
            }
        }
    }

    //GUI Stuff
    waveformSelect = document.getElementById("waveformSelect");
    waveformSelect.onchange = () => { changeWaveform(waveformSelect.value); };

    //FilterGUI
    filterSelect = document.getElementById("filterSelect");
    filterSelect.onchange = () => { filter.type = filterSelect.value; };

    filterLFOSelect = document.getElementById("filterLFOSelect");
    filterLFOSelect.onchange = () => { filterLFO = changeLFO(filterLFO, filterLFOGain, filterLFOSelect.value); };

    reverbSelect = document.getElementById("reverbSelect");
    reverbSelect.onchange = () => { reverb.buffer = impulseResponses[reverbSelect.value]; };

    // Sequencer
    sequenceOn = document.getElementById("sequenceOn");
    sequenceOn.onchange = () => {
        if (sequenceOn.checked) {
            seqMode = true;
        }
        else {
            seqMode = false;
        }
    }

    sequenceModeSelect = document.getElementById("sequenceModeSelect");
    sequenceModeSelect.onchange = () => {
        seqRandom = false;
        switch (sequenceModeSelect.value) {
            case 'normal':
                break;
            case 'up':
                sequence.sort();
                console.log(sequence);
                break;
            case 'down':
                sequence.sort((a, b) => b - a);
                console.log(sequence);
                break;
            case 'random':
                seqRandom = true;
                break;
        }
    }

    sequenceHold = document.getElementById("sequenceHold");
    sequenceHold.onchange = () => {
        if (!sequenceHold.checked) {
            sequence.forEach(function (noteNumber) {
                synthesizer.noteOff(noteNumber);
            });
            sequence = [];
        }
    }

    sequenceClear = document.getElementById("clearButton");
    sequenceClear.onclick = () => {
        sequence.forEach(function (noteNumber) {
            synthesizer.noteOff(noteNumber);
        });
        sequence = [];
    }

    textInput = document.getElementById("textInput");
    textInputOk = document.getElementById("textInputOK");
    textInputOk.onclick = () => {
        sequence.forEach(function (noteNumber) {
            synthesizer.noteOff(noteNumber);
        });
        sequenceID = -1;
        parseSequence(textInput.value);
        playSequence();
    }

    context.resume();
}

function onMIDIInit(midiAccess) {
    midi = midiAccess;
    var inputs = midi.inputs.values();

    console.log(midi.outputs);

    for (output of midi.outputs.values()) {
        midiOut = output;
        break;
    }

    console.log("MIDI: " + midiOut);

    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = MIDIMessageHandler;
        console.log("MIDI Input. Yeah!");
    }

    //playNote();
    playSequence();
}

function MIDIMessageHandler(event) {
    switch (event.data[0] & 0xf0) {
        case 0x90:
            if (event.data[2] != 0) {

                if (!seqMode) {
                    synthesizer.noteOn(event.data[1]);
                    delayGain.gain.setTargetAtTime(delayGainValue, 0, 0.001);
                }
                else {
                    sequence.push(event.data[1]);

                    if (!timeOut) {
                        playSequence();
                    }

                    console.log("MIDI Data: " + sequence);
                }
                return;
            }
        case 0x80:
            synthesizer.noteOff(event.data[1]);

            if (!sequenceHold.checked) {
                sequence.splice(sequence.indexOf(event.data[1]), 1);
            }

            delayGain.gain.setTargetAtTime(0, 0, delayFeedbackTime);
            return;
    }
}

function playSequence() {
    if (seqMode && sequence.length > 0) {
        switch (sequenceModeSelect.value) {
            case 'normal':
                break;
            case 'up':
                sequence.sort();
                break;
            case 'down':
                sequence.sort((a, b) => b - a);
                break;
        }

        if (sequenceID >= 0) {
            //midiOut.send([0x80, sequence[sequenceID], 0x7f]);
            synthesizer.noteOff(sequence[sequenceID]);
            delayGain.gain.setTargetAtTime(0, 0, delayFeedbackTime);
        }

        sequenceID++;

        if (sequenceID >= sequence.length) {
            sequenceID = 0;
        }

        if (seqRandom) {
            seqIndex = Math.floor(Math.random() * sequence.length);
            seqIndex = seqIndex == seqLastID ? (seqIndex + 1) % sequence.length : seqIndex;
            seqLastID = seqIndex;

            if(sequence[seqIndex] != 0){
                synthesizer.noteOn(sequence[seqIndex]);
            }
        }
        else {
            if(sequence[sequenceID] != 0){
                synthesizer.noteOn(sequence[sequenceID]);
            }
        }

        delayGain.gain.setTargetAtTime(delayGainValue, 0, 0.001);

    }

    if (sequence.length == 0) {
        clearTimeout(timeOut);
        timeOut = null;
    }
    else {
        timeOut = setTimeout(playSequence, sequenceSpeed);
    }
}

function freqFromNoteNumber(noteNumber) {
    return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

function changeWaveform(waveform) {
    synthesizer = synthesizer.createNew(waveform);
}
/*
function changeFilter(newFilterType) {
    retFilter = new BiquadFilterNode(context);
    retFilter.type = newFilterType;
    retFilter.frequency.value = filter.frequency.value;
    retFilter.Q.value = filter.Q.value;
    retFilter.gain.value = filter.gain.value;

    filter = retFilter;
}*/

function changeLFO(oldLFO, oldLFOGain, newLFOType) {
    newLFO = new OscillatorNode(context);
    newLFO.type = newLFOType;

    oldLFO.stop();
    oldLFO.disconnect();

    newLFO.frequency.value = oldLFO.frequency.value;

    newLFO.connect(oldLFOGain);
    newLFO.start();
    return newLFO;
}

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for (; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function makeMIDITable() {
    noteLetters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    midiTable = [];
    octaveNumber = 0;

    for (var i = 0; i < 96; i++) {
        if (i % 12 == 0) {
            octaveNumber++;
        }

        index = i % noteLetters.length;
        midiTable.push(noteLetters[index] + octaveNumber);
    }

    return midiTable;
}

function parseSequence(textSequence) {
    sequence = [];
    splitTextSequence = textSequence.split(" ");

    splitTextSequence.forEach(function (noteInfo) {
        noteLetter = noteInfo.split(':')[0];
        multiplier = noteInfo.split(':')[1];

        if(!multiplier){
            multiplier = 1;
        }

        if (noteLetter == 'o') {
            for(var i = 0; i < multiplier; i++){
                sequence.push(0);
            }
        }
        else {
            for(var i = 0; i < multiplier; i++){
                sequence.push(midiNoteNumbers.indexOf(noteLetter) + midiNumberOffset);
            }
            
        }
    });

    console.log(sequence);
}

