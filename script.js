

var containerArray = new Array();
var audioContext = new AudioContext();
var masterGain = audioContext.createGain();
masterGain.gain.value = .01;
masterGain.connect(audioContext.destination);

function makeDraggable(elemId){
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var elem = document.getElementById(elemId);

    if(document.getElementById("dragButton" + elemId)){
        document.getElementById("dragButton" + elemId).onmousedown = dragMouseDown;
    }
    else {
        document.getElementById(elemId).onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e=e || window.event;
        e.preventDefault();

        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e){
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        elem.style.top = (elem.offsetTop - pos2) + "px";
        elem.style.left = (elem.offsetLeft - pos1) + "px";
    }

    function closeDragElement(){
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function setMasterGain(){
    masterGain.gain.setValueAtTime(document.getElementById("masterGainSlider").value, audioContext.currentTime);
}

function createNewContainer(){
    containerArray.push(new Container());
    printContainerIds();
}

function createNewSynth(){
    var waveform = document.getElementById("waveformPicker").value;
    containerArray.push(new Synth(waveform));
}

function printContainerIds(){
    containerArray.forEach((container) => {
        console.log("Test: " + container.elemId);
    });
}