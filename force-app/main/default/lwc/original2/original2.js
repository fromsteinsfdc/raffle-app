import { LightningElement, api, track, wire } from 'lwc';
import beep1 from '@salesforce/resourceUrl/beep1';
import boop2 from '@salesforce/resourceUrl/boop2';
import snap2 from '@salesforce/resourceUrl/snap2';
import getDrawingParticipants from '@salesforce/apex/RaffleAppController.getDrawingParticipants';
/*
import beep2 from '@salesforce/resourceUrl/beep2';
import boop1 from '@salesforce/resourceUrl/boop1';
import bop1 from '@salesforce/resourceUrl/bop1';
import boop_short from '@salesforce/resourceUrl/boop_short';
import clap1 from '@salesforce/resourceUrl/clap1';
import clap2 from '@salesforce/resourceUrl/clap2';
import snap1 from '@salesforce/resourceUrl/snap1';
*/
const NAMES_CSV = 'Maximilian Thompson,Alina Reed,Sienna Carroll,Sawyer Farrell,Bruce Barrett,Florrie Gibson,James Mason,Catherine Evans,Lucy Dixon,Dale Casey,Cherry Payne,Kevin Brown,Camila Higgins,Melanie Allen,Myra Phillips,Luke Mason,Sofia Stevens,Garry Jones,Adison Payne,Naomi Perry,Walter Parker,Steven Harper,Sophia Howard,Owen Craig,Patrick Tucker,Vincent Armstrong,Savana Watson,Maddie Phillips,Elian Carroll,Kelsey Jones,Alford Mitchell,Cherry Scott,Kristian Russell,April Parker,Deanna Higgins,Frederick Allen,April Richardson,Paige Murphy,Elise Myers,Olivia Cole,James Murray,Nicole Walker,Walter Roberts,Rosie Farrell,Samantha Ross,Fiona West,Cherry Riley,Alen Ryan,Isabella Warren,Carl Sullivan,Joyce Allen,Dexter Evans,Valeria Turner,Carl Carroll,Vanessa Hamilton,Heather Wilson,Samantha Payne,Kristian Mason,Marcus Taylor,Tony Walker,Julian Allen,Kevin Kelly,Derek Evans,Edward Myers,Charlie Wells,Adrian Johnson,Richard Davis,Dexter Martin,Derek Hunt,Camila Wells,Ada Parker,Charlie Scott,Kirsten Farrell,Sophia Cameron,Clark Parker,Natalie Wright,Vivian Baker,Tara Baker,Adrianna Anderson,Mary Morgan,Amber Foster,Penelope Owens,Tiana Brooks,Elise Tucker,Rubie Sullivan,Amber Morrison,Adam Stewart,Blake Parker,Eleanor Campbell,Cherry Myers,Ted Morgan,Ellia Riley,Valeria Johnson,Anna Hill,Emily Cole,Florrie Brown,Chloe Campbell,Patrick Murphy,George Montgomery,Kimberly Myers,Frederick Higgins,Dominik Williams,Daisy Jones,Dale Ellis,John Payne,Paul Johnson,Heather Barnes,Mike Baker,Dominik Craig,Robert Phillips,Naomi Scott,Brooke Smith,Maximilian Adams,Chelsea Brown,Tony Adams,Lyndon Harris,Alford Farrell,Dale Crawford,Daryl Davis,Rafael Phillips,Adam Owens,Lyndon Walker,Rubie Barrett,Blake Cole,Edwin Jones,Jack Thompson,Chester Hall,Penelope Chapman,Derek Murphy,Agata Scott,Roland Adams,Adison Murray,Frederick Farrell,Ellia Stewart,Chester Richardson,Aston Armstrong,Richard Wright,George Rogers,Lana Ferguson,Daisy Russell,Daryl Scott,Belinda Sullivan,Marcus Davis,Jenna Carroll,Miller Phillips,Jordan Hamilton,Amelia Harper,Adelaide Richards,Amanda Scott,Michelle Owens,Ted Thompson,Jenna Warren,Alexander Ferguson,Grace Ryan,Aldus Wells,Tyler Taylor,Cadie Brown,Sienna Casey,Adison Wilson,Maria Phillips,Oliver Spencer,Samantha Myers,Agata Wells,Ted Clark,Rebecca Morgan,Dale Parker,Tara Reed,Adison Walker,Jacob Barrett,Melanie Wilson,Lana Walker,Adelaide Lloyd,Chester Elliott,Preston Payne,Evelyn Andrews,Abigail Stevens,Wilson Casey,Patrick Mason,Ned Mitchell,Victor Walker,Sam Richards,Frederick Ross,Joyce Tucker,Emily Holmes,Ryan Brown,Darcy Williams,Victoria Robinson,Arnold Hamilton,Edwin Wright,Ned Armstrong,Preston Richardson,Melanie Hawkins,Miley Morgan,Roland Stewart,Dexter Chapman,Cadie Wright,Adele Miller,Thomas Mitchell,Mary Morris,Lenny Phillips';
const DEFAULT_NUM_SLOTS = 11;

export default class Original2 extends LightningElement {

    @api drawingId = 'aAr4x000000Gr68CAC';

    @api numSlots = DEFAULT_NUM_SLOTS;
    @track nameSlots = [];
    @track names;

    audioContext;

    nameIndex = 0;

    soundStaticResources = [
        { name: 'beep', src: beep1 },
        { name: 'boop', src: boop2 },
        { name: 'snap', src: snap2 },
    ];
    boopIndex = 0;  // used to manage the alternating of beep and boop sounds in the beepboop sound effect

    soundEffects = [
        { label: 'Beep-Boop', value: 'beepboop' },
        { label: 'Just Beeps', value: 'beepbeep' },
        //{ label: 'Just Boops', name: 'boopboop' },
        { label: 'Tones (random)', value: 'tones' },
        { label: 'Snap', value: 'snap' },
        { label: 'No sound', value: 'nosound' }
    ];
    currentSoundEffect;
    
    countdownSpeed = 750;
    countdownFrom = 3;

    doSpin = false;
    numRotations = 0;

    tones = [131, 147, 165, 175, 196, 220, 247, 262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698];//, 784, 880, 988];

    @track speeds = [
        [20, 500],
        [30, 575],
        [40, 500],
        [50, 500],
        [60, 500],
        [75, 250],
        [90, 250],
        [100, 300],
        [125, 300],
        [150, 600],
        [200, 800],
        [500, 1500],
        [1000, 2000]
    ];
    speedIndex = 0;
    totalNumberOfSpins = 0;

    rendered;
    isLoading;

    /* GETTERS */
    get maxFromCenter() {
        return Math.floor(this.numSlots / 2);
    }

    get defaultNames() {
        return NAMES_CSV;
    }

    get centerSlot() {
        return this.template.querySelector('[data-index="' + this.maxFromCenter + '"]')
    }

    get soundFiles() {
        return this.template.querySelectorAll('audio');
    }

    get soundEffectOptions() {
        return this.soundEffects.map(el => {
            return {
                label: el.label,
                value: el.name
            }
        });
    }

    /* CALLBACKS */
    connectedCallback() {
        console.log('connectedCallback!');
        this.audioContext = new AudioContext();

        // Give our speeds some labels
        let totalDuration = 0;
        this.speeds = this.speeds.map(pair => {
            let speed = {
                rate: pair[0],
                duration: pair[1]                
            }
            totalDuration += speed.duration;
            this.totalNumberOfSpins += Math.ceil(speed.duration / speed.rate);
            return speed;
        });
        console.log('totalDuration = '+ totalDuration/1000);
        console.log('totalNumberOfSpins = '+ this.totalNumberOfSpins);

        // Generate randomized sequence of names from input
        //this.names = this.randomizeNames(this.defaultNames.split(','));
        //this.names = this.names.sort(() => Math.random() - 0.5);

        // Default to first sound effect if none pre-selected
        if (!this.currentSoundEffect && this.soundEffects[0])
            this.currentSoundEffect = this.soundEffects[0].value;
        console.log(JSON.stringify(this.soundEffects));
    }

    renderedCallback() {
        if (this.rendered) return;
        this.rendered = true;

        console.log('renderedCallback!');
        for (let soundFile of this.soundFiles) {
            //console.log(soundFile.dataset.name + ' duration = ' + soundFile.duration);
        }
    }

    /* WIRE METHODS */
    @wire(getDrawingParticipants, {drawingId: '$drawingId'})
    handleGetDrawingParticipants({error, data}) {
        this.isLoading = true;
        console.log('wire method');
        if (data) {
            this.names = [];
            let totalTickets = 0;
            for (let participant of data) {

                //console.log(JSON.stringify(participant), participant.Number_of_Tickets__c);
                for (let i=0; i<participant.Number_of_Tickets__c; i++) {
                    this.names.push(participant.Name);
                }
                totalTickets += participant.Number_of_Tickets__c;
            }
            console.log('totalTickets = '+ totalTickets);
            this.names = this.randomizeNames(this.names);
            this.initializeNames();
            this.isLoading = false;
        }
        if (error) {
            console.log('Error getting participants: '+ JSON.stringify(error));
        }
    }

    /* EVENT HANDLERS */
    handleSoundEffectChange(event) {
        this.currentSoundEffect = event.detail.value;
        console.log('sound effect = '+ this.currentSoundEffect);
    }

    handleSpinClick() {
        this.doSpin = !this.doSpin;
        if (this.doSpin) {
            this.template.querySelector('.sidePanel').classList.remove('active');
            this.countdown(this.countdownFrom);
        }
    }

    activateSidePanel() {
        this.template.querySelector('.sidePanel').classList.toggle('active');
    }

    /* WHEEL SPINNING FUNCTIONS */
    startSpin() {
        requestAnimationFrame(timestamp => {
            this.advanceNames(timestamp);
        });
    }

    initializeNames() {
        this.nameIndex = 0;
        for (let i = 0; i < this.numSlots; i++) {
            this.nameSlots.push({
                index: i,
                label: this.names[i]
            });
            this.nameIndex++;
        }
    }

    advanceNames(timestamp, prevTimestamp, currentSpeedStart) {
        prevTimestamp = prevTimestamp || timestamp;
        currentSpeedStart = currentSpeedStart || timestamp;

        // Has it been long enough since the previous spin according to the current speed setting?
        if (timestamp - prevTimestamp >= this.speeds[this.speedIndex].rate) {
            prevTimestamp = timestamp;

            this.playSound(this.speeds[this.speedIndex].rate);

            this.nameIndex++;
            console.log(this.nameIndex);
            if (this.nameIndex >= this.names.length) {
                this.nameIndex = 0;
                this.numRotations++;
                console.log('numRoations = '+ this.numRotations);
            }

            for (let i = this.numSlots - 1; i > 0; i--) {
                this.nameSlots[i].label = this.nameSlots[i - 1].label;
            }
            this.nameSlots[0].label = this.names[this.nameIndex];

            // If there have been enough spins at the current speed, increment to the next speed
            if (timestamp - currentSpeedStart >= this.speeds[this.speedIndex].duration) {
                currentSpeedStart = timestamp;
                this.speedIndex++;
            }
        }

        if (this.doSpin) {
            if (this.speedIndex < this.speeds.length) {
                requestAnimationFrame(timestamp => {
                    this.advanceNames(timestamp, prevTimestamp, currentSpeedStart);
                })
            } else this.endWheel(true);
        } else this.endWheel();
    }

    // reset variables, handle any post-selection logic
    endWheel(doFlash) {
        this.doSpin = false;
        this.speedIndex = 0;
        if (doFlash)
            this.flashLights();
    }

    flashLights() {
        let flash = true;
        let flashInterval = 250;
        let maxFlashes = 10;
        let flashCount = 0;
        let flashRefresh = setInterval(() => {
            if (flash == true) {
                this.centerSlot.classList.remove('flash');
            } else {
                flashCount++;
                this.centerSlot.classList.add('flash');
            }
            flash = !flash;
            if (flashCount > maxFlashes) {
                clearInterval(flashRefresh);
            }
        }, flashInterval)
    }

    // Animates the countdown before the raffle spinning starts
    countdown(startNum, currentNum = 0) {
        let countdownDiv = this.template.querySelector('.countdown');
        if (!countdownDiv) {
            console.log('error: div with class countdown not found');
            return;
        }

        if (currentNum < startNum) {
            countdownDiv.classList.remove('slds-hide');
            countdownDiv.innerText = (startNum - currentNum);
            countdownDiv.animate([
                { // from
                    opacity: 1,
                    fontSize: '50vw'
                },
                { // to
                    opacity: .5,
                    fontSize: 0
                }
            ], this.countdownSpeed);
            setTimeout(() => this.countdown(startNum, currentNum + 1), this.countdownSpeed);
        } else {
            countdownDiv.classList.add('slds-hide');
            this.doSpin = true;
            this.startSpin();
            console.log('countdown finished');
        }
    }

    /* AUDIO FUNCTIONS */
    playSound(length) {
        if (this.currentSoundEffect == 'beepboop') {
            /*
            if (this.boopIndex === 0) {
                this.playSoundFile('boop', 1.5);
            } else {
                this.playSoundFile('beep');
            }*/
            this.playSoundFile(this.boopIndex ? 'beep' : 'boop');
            this.boopIndex = this.boopIndex ? 0 : 1;
        } else if (this.currentSoundEffect == 'tones') {
            this.playTone(length);
        } else if (this.currentSoundEffect == 'snap') {
            this.playSoundFile('snap', 1.5);
        } else if (this.currentSoundEffect == 'beepbeep') {
            this.playSoundFile('beep');
        }/* else if (this.currentSoundEffect == 'boopboop') {
            this.playSoundFile('boop', 1.5);
        }*/
    }

    playTone(length, overrideLength) {
        if (length > 100 && !overrideLength) {
            length = 100 + length / 10;
        }

        const oscillator = this.audioContext.createOscillator()
        const envelope = this.audioContext.createGain()
        const decayRate = 1.5 // seconds

        //oscillator.frequency.value = Math.random() * 450 + 200;   // randomizing within a range
        oscillator.frequency.value = this.getRandomValueFrom(this.tones) * 1.5; // the 1.5 is just for flavour
        //oscillator.frequency.value = 425 - this.speeds[this.speedIndex].rate / 4; // attempt at having a descending tone that gets lower as the speed decreases

        oscillator.type = 'sine'
        envelope.gain.value = 1
        //console.log(oscillator.frequency.value.toFixed(3), oscillator.type, length);

        oscillator.connect(envelope)
        envelope.connect(this.audioContext.destination)

        oscillator.start(this.audioContext.currentTime)
        envelope.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + decayRate)
        setTimeout(() => oscillator.stop(this.audioContext.currentTime), decayRate * length)
    }

    getSoundFile(name) {
        for (let soundFile of this.soundFiles) {
            if (soundFile.dataset.name === name) {
                return soundFile;
            }
        }
        return null;
    }

    playSoundFile(fileName, startTime = 0) {
        let soundFile = this.getSoundFile(fileName);
        if (soundFile) {
            soundFile.currentTime = startTime;
            soundFile.play();
        } else {
            console.log('Soundfile with name ' + soundFile.dataset.name + ' not found');
        }
    }


    /* HELPER FUNCTIONS */
    randomizeNames(names) {
        return names.sort(() => Math.random() - 0.5);
    }

    getRandomValueFrom(fromArray) {
        let ran = parseInt(Math.random() * fromArray.length, 10);
        return fromArray[ran];
    }
}