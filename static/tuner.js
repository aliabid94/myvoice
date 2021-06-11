class Tuner {
    constructor() {
        this.middleA = 440;
        this.semitone = 69;
        this.bufferSize = 4096;
        this.noteStrings = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];
        this.initGetUserMedia();
    }

    initGetUserMedia() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!window.AudioContext) {
            return swal("AudioContext not supported.");
        }

        // Older browsers might not implement mediaDevices at all, so we set an empty object first.
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {
                // First get ahold of the legacy getUserMedia, if present.
                const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                // Some browsers just don't implement it - return a rejected promise with an error
                // to keep a consistent interface.
                if (!getUserMedia) {
                    swal("getUserMedia is not implemented in this browser.");
                }

                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise.
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            };
        }
    }

    startRecord() {
        const self = this;

        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            self.audioContext.createMediaStreamSource(stream).connect(self.analyser);
            self.analyser.connect(self.scriptProcessor);
            self.scriptProcessor.connect(self.audioContext.destination);
            self.scriptProcessor.addEventListener("audioprocess", function (event) {
                let channel_data = event.inputBuffer.getChannelData(0);
                const frequency = self.pitchDetector.do(channel_data);

                if (frequency && self.onNoteDetected) {
                    const note = self.getNote(frequency);
                    const volume_reducer = (accumulator, currentValue) => accumulator + Math.abs(currentValue);
                    let volume = channel_data.reduce(volume_reducer)

                    self.onNoteDetected({
                        name: self.noteStrings[note % 12],
                        value: note,
                        cents: self.getCents(frequency, note),
                        octave: parseInt(note / 12) - 1,
                        frequency: frequency,
                        volume: volume
                    });
                }
            });
        })
        .catch(function (error) {
            swal(error.name + ": " + error.message);
        });
    }

    init() {
        this.audioContext = new window.AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
        const self = this;

        Aubio().then(function (aubio) {
            self.pitchDetector = new aubio.Pitch("default", self.bufferSize, 1, self.audioContext.sampleRate);
            self.startRecord();
        });
    }

    getNote(frequency) {
        const note = 12 * (Math.log(frequency / this.middleA) / Math.log(2));
        return Math.round(note) + this.semitone;
    }

    getStandardFrequency(note) {
        return this.middleA * Math.pow(2, (note - this.semitone) / 12);
    }

    getCents(frequency, note) {
        return Math.floor((1200 * Math.log(frequency / this.getStandardFrequency(note))) / Math.log(2));
    }

    play(frequency) {
        if (!this.oscillator) {
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.connect(this.audioContext.destination);
            this.oscillator.start();
        }

        this.oscillator.frequency.value = frequency;
    }

    stop() {
        this.oscillator.stop();
        this.oscillator = null;
    }
}