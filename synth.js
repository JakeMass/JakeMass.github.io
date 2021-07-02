class Synth {
    oscs = [];
    oscEnvs = [];

    synthGain = null;

    waveform = null;

    attack = 0.0;
    decayTime = 0.3;
    decayGain = 0.5;
    sustainGain = 0.5;
    release = 0.01;
    portamento = 0.0;

    audioCtx = null;
    destination = null;
    midi = null;
    

    constructor( audioCtx, destination, midi, numberOfVoices, waveform ){
        this.synthGain = audioCtx.createGain();
        this.synthGain.gain.value = 0.3;
        this.synthGain.connect(destination);
        this.destination = destination;
        this.audioCtx = audioCtx;
        this.waveform = waveform;
        this.createOscillators(numberOfVoices);

        this.midi = midi;
    }

    createOscillators(numberOfVoices){
        for( var i = 0; i < numberOfVoices; i++){
            var osc = this.audioCtx.createOscillator();
            var env = this.audioCtx.createGain();

            env.gain.value = 0.0;

            osc.type = this.waveform;
            osc.frequency.setValueAtTime(0, this.audioCtx.currentTime);

            osc.connect(env);
            env.connect(this.synthGain);

            osc.start();
            this.oscs.push([osc, -1]);
            this.oscEnvs.push(env);
        }
    }

    noteOn(noteNumber){
        var freeOsc = null;
        var freeOscEnv = null;

        for( var i = 0; i < this.oscs.length; i++){
            if(this.oscs[i][1] == -1){
                freeOsc = this.oscs[i][0];
                this.oscs[i][1] = noteNumber;
                freeOscEnv = this.oscEnvs[i];
                break;
            }
        }

        if(freeOsc){
            freeOsc.frequency.cancelScheduledValues(0);
            freeOsc.frequency.setTargetAtTime(freqFromNoteNumber(noteNumber), this.audioCtx.currentTime, this.portamento);
            freeOscEnv.gain.cancelScheduledValues(0);
            // Attack
            freeOscEnv.gain.setTargetAtTime(this.decayGain, 0, this.attack);
            // Decay
            freeOscEnv.gain.setTargetAtTime(this.sustainGain, this.audioCtx.currentTime + this.attack, this.decayTime);
        }
    }

    noteOff(noteNumber){
        var env = null;

        for( var i = 0; i < this.oscs.length; i++){
            if(this.oscs[i][1] == noteNumber){
                env = this.oscEnvs[i];
                env.gain.cancelScheduledValues(0);
                env.gain.setTargetAtTime(0.0, 0, this.release);
                this.oscs[i][1] = -1;
            }
        }
    }

    setAttack(newAttack){
        console.log(newAttack);
        this.attack = newAttack;
    }

    setDecayTime(newDecayTime){
        this.decayTime = newDecayTime;
    }

    setDecayGain(newDecayGain){
        this.decayGain = newDecayGain;
    }

    setSustainGain(newSustainGain){
        this.sustainGain = newSustainGain;
    }

    setRelease(newRelease){
        this.release = newRelease;
    }

    connectTo(destination){
        this.synthGain.disconnect();
        this.synthGain.connect(destination);
        this.destination = destination;
    }

    connectToDetune(mod){
        //mod.disconnect();
        this.oscs.forEach(function(oscillator){
            mod.connect(oscillator[0].detune);
        });
    }

    connectToGain(mod){
        //mod.disconnect();
        mod.connect(this.synthGain.gain);
    }

    createNew(waveform){
        for(var i = 0; i < this.oscs.length; i++){
            this.oscs[i][0].stop();
        }

        var synth = new Synth(this.audioCtx, this.destination, this.midi, this.oscs.length, waveform);

        synth.setAttack(this.attack);
        synth.setDecayTime(this.decayTime);
        synth.setDecayGain(this.decayGain);
        synth.setSustainGain(this.sustainGain);
        synth.setRelease(this.release);

        return synth;
    }

    changeFrequency(freq){
        for(var i = 0; i < this.oscs.length; i++){
            this.oscs[i][0].frequency.cancelScheduledValues(0);
            this.oscs[i][0].frequency.setTargetAtTime(freq, 0, 0);
            console.log(this.oscs[i][0].frequency.value);
        }
    }

    changeGain(value){
        this.synthGain.gain.cancelScheduledValues(0);
        this.synthGain.gain.setTargetAtTime(value, 0, 0);
        console.log(this.synthGain.gain.value);
    }

    setPortamento(value){
        this.portamento = value;
    }
}