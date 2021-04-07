class Container {
    static numberOfContainer = 0;

    constructor(){
        this.elemId = this.addElement();
    }

    addElement(){
        // create new div for Container
        var newContainer = document.createElement("div");
        newContainer.className = "container";
        newContainer.id = "container" + Container.numberOfContainer;

        var menubar = document.createElement("div");
        menubar.className = "containerMenubar";
        menubar.id = "menubar" + newContainer.id;
        newContainer.appendChild(menubar);
        
        // add a Button to be able to drag the Container 
        var dragButton = document.createElement("div");
        dragButton.className = "drag";
        dragButton.id = "dragButton" + newContainer.id;
        menubar.appendChild(dragButton);
    
        // add a delete Button to remove the Container
        var deleteButton = document.createElement("div");
        deleteButton.className = "delete";
        deleteButton.id = "deleteButton" + newContainer.id;
        deleteButton.style.backgroundColor = "red";

        deleteButton.onclick = () => { 
            newContainer.remove();
            this.deleteContainer();      
        };

        menubar.appendChild(deleteButton);
    
        // add the Container to DOM
        document.body.appendChild(newContainer);
        Container.numberOfContainer++;

        // make the Container draggable
        makeDraggable(newContainer.id)

        console.log(newContainer.id + " created");
        return newContainer.id;
    }

    deleteContainer(){ console.log(this.elemId + " deleted"); }
}

class Synth extends Container {

    constructor(waveform){
        super();
        this.waveform = waveform;
        this.defaultFreq = 440;

        // create a new OscillatorNode
        this.osc = new OscillatorNode(audioContext, {type: waveform, frequency: this.defaultFreq});

        // setting up the Synth's gain and creating new GainNode
        this.currentGainValue = .5;
        this.gain = new GainNode(audioContext);
        this.gain.gain.value = this.currentGainValue;
        this.gain.connect(masterGain);

        // connect the Oscillator to the GainNode
        this.osc.connect(this.gain);
        this.osc.start();

        // make the UI
        this.addUI();
    }

    addUI(){
        var docElem = document.getElementById(this.elemId);
        // make the Stop/Mute Button
        var stopButton = document.createElement("div");
        stopButton.className = "stop";
        stopButton.id = "stopButton" + this.elemId;
        stopButton.onclick = () => {
            this.gain.gain.setValueAtTime(0, audioContext.currentTime);
        };
        document.getElementById("menubar" + this.elemId).appendChild(stopButton);

        // make the Play/Unmute Button
        var playButton = document.createElement("div");
        playButton.className = "play";
        playButton.id = "playButton" + this.elemId;
        playButton.onclick = () => {
            this.gain.gain.setValueAtTime(this.currentGainValue, audioContext.currentTime);
        };
        document.getElementById("menubar" + this.elemId).appendChild(playButton);

        // make gainSlider and label it
        var gainControl = document.createElement("div");
        gainControl.className = "controlUnit";
        gainControl.id = "gainControl" + this.elemId;
        docElem.appendChild(gainControl);

        var gainSlider = document.createElement("input");
        gainSlider.className = "slider";
        gainSlider.id = "gainSlider" + this.elemId;
        gainSlider.type = "range";
        gainSlider.min = "0";
        gainSlider.max = "1";
        gainSlider.step = ".01";
        gainSlider.defaultValue = this.currentGainValue;
        gainSlider.oninput = () => {
            this.gain.gain.setValueAtTime(gainSlider.value, audioContext.currentTime);
        }

        var gainLabel = document.createElement("div");
        gainLabel.className = "label";
        gainLabel.id = "gainLabel" + this.elemId;
        gainLabel.innerText = "Gain";

        var gainJackInput = document.createElement("div");
        gainJackInput.className = "jackInput";
        gainJackInput.id = "gainJackInput" + this.elemId;
        
        gainControl.appendChild(gainJackInput);
        gainControl.appendChild(gainLabel);
        gainControl.appendChild(gainSlider);

        // make frequencySlider and label it
        var freqControl = document.createElement("div");
        freqControl.className = "controlUnit";
        freqControl.id = "freqControl" + this.elemId;
        docElem.appendChild(freqControl);

        var freqSlider = document.createElement("input");
        freqSlider.className = "slider";
        freqSlider.id = "freqSlider" + this.elemId;
        freqSlider.type = "range";
        freqSlider.min = "1";
        freqSlider.max = "2000";
        freqSlider.defaultValue = this.defaultFreq;

        var freqLabel = document.createElement("div");
        freqLabel.className = "label";
        freqLabel.id = "freqLabel" + this.elemId;
        freqLabel.innerText = "Frequency";

        var freqJackInput = document.createElement("div");
        freqJackInput.className = "jackInput";
        freqJackInput.id = "freqJackInput" + this.elemId;

        // make input via keyboard possible
        var freqInput = document.createElement("input");
        freqInput.className = "textInput";
        freqInput.id = "freqInput" + this.elemId;
        freqInput.type = "text";
        freqInput.defaultValue = this.defaultFreq;

        freqInput.oninput = () => {
            this.osc.frequency.setValueAtTime(freqInput.value, audioContext.currentTime);
            freqSlider.value = freqInput.value;
        };

        freqSlider.oninput = () => {
            this.osc.frequency.setValueAtTime(freqSlider.value, audioContext.currentTime);
            freqInput.value = freqSlider.value;
        };
        freqControl.appendChild(freqJackInput);
        freqControl.appendChild(freqLabel);
        freqControl.appendChild(freqInput);
        freqControl.appendChild(freqSlider);

    }

    deleteContainer(){
        // some "cleanup"
        this.osc.stop();
        this.osc = null;
        console.log(this.elemId + " deleted");
    }
}

