// Modul Timer Latihan Interaktif (Stomach Vacuum, Dead Hang, Prone Y-T-W)
class ExerciseTimer {
    constructor() {
        this.currentMode = 'vacuum';
        this.isRunning = false;
        this.interval = null;
        this.currentSet = 1;
        this.totalSets = 5;
        this.workTime = 15;
        this.restTime = 25;
        this.timeLeft = 15;
        this.stage = 'ready'; // ready, prep, work, rest, done

        this.audioCtx = null;
    }

    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
    }

    playBeep(frequency = 600, duration = 0.15, type = 'sine') {
        try {
            this.initAudio();
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = frequency;
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            console.log('Audio beep blocked or unsupported', e);
        }
    }

    setMode(mode) {
        this.stop();
        this.currentMode = mode;
        this.currentSet = 1;

        if (mode === 'vacuum') {
            this.totalSets = 5;
            this.workTime = 15;
            this.restTime = 25;
            this.instruction = "Buang napas habis lewat mulut, tarik pusar sedalam mungkin ke arah tulang belakang (perut kempis maksimal). Tahan sambil bernapas tipis.";
        } else if (mode === 'hang') {
            this.totalSets = 3;
            this.workTime = 30;
            this.restTime = 45;
            this.instruction = "Bergantung rileks pada pull-up bar / kusen pintu. Biarkan gravitasi menarik tulang belakang. Lakukan pernapasan perut panjang.";
        } else if (mode === 'ytw') {
            this.totalSets = 3;
            this.workTime = 20;
            this.restTime = 30;
            this.instruction = "Tengkurap, angkat dada sedikit. Bentuk huruf Y (tahan 2s), T (tahan 2s), W (tahan 2s rapatkan belikat). Kunci postur teguh.";
        }

        this.timeLeft = this.workTime;
        this.stage = 'ready';
        this.updateUI();
    }

    start() {
        if (this.isRunning) return;
        this.initAudio();
        this.isRunning = true;
        
        if (this.stage === 'ready' || this.stage === 'done') {
            this.stage = 'work';
            this.timeLeft = this.workTime;
            this.playBeep(800, 0.25);
        }

        this.interval = setInterval(() => {
            this.tick();
        }, 1000);

        this.updateUI();
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.updateUI();
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.stage = 'ready';
        this.currentSet = 1;
        this.timeLeft = this.workTime;
        this.updateUI();
    }

    tick() {
        if (this.timeLeft > 1) {
            this.timeLeft--;
            if (this.timeLeft <= 3) {
                this.playBeep(500, 0.1);
            }
        } else {
            // Switch stage
            if (this.stage === 'work') {
                if (this.currentSet < this.totalSets) {
                    this.stage = 'rest';
                    this.timeLeft = this.restTime;
                    this.playBeep(400, 0.4);
                } else {
                    this.stage = 'done';
                    this.isRunning = false;
                    clearInterval(this.interval);
                    this.playBeep(900, 0.6);
                }
            } else if (this.stage === 'rest') {
                this.currentSet++;
                this.stage = 'work';
                this.timeLeft = this.workTime;
                this.playBeep(850, 0.3);
            }
        }
        this.updateUI();
    }

    updateUI() {
        const timeDisplay = document.getElementById('timer-time-display');
        const phaseDisplay = document.getElementById('timer-phase-display');
        const setDisplay = document.getElementById('timer-set-display');
        const circle = document.getElementById('timer-circle');
        const instrEl = document.getElementById('timer-instruction-text');
        const btnStart = document.getElementById('btn-timer-start');

        if (!timeDisplay) return;

        timeDisplay.innerText = this.timeLeft < 10 ? `0${this.timeLeft}` : this.timeLeft;

        if (this.stage === 'work') {
            phaseDisplay.innerText = 'TAHAN (WORK)';
            phaseDisplay.style.color = '#15803d';
            circle.className = 'timer-circle active';
        } else if (this.stage === 'rest') {
            phaseDisplay.innerText = 'ISTIRAHAT (REST)';
            phaseDisplay.style.color = '#0284c7';
            circle.className = 'timer-circle resting';
        } else if (this.stage === 'done') {
            phaseDisplay.innerText = 'SELESAI!';
            phaseDisplay.style.color = '#7c3aed';
            circle.className = 'timer-circle';
        } else {
            phaseDisplay.innerText = 'SIAP';
            phaseDisplay.style.color = '#64748b';
            circle.className = 'timer-circle';
        }

        setDisplay.innerText = `Set ${this.currentSet} dari ${this.totalSets}`;
        if (instrEl && this.instruction) {
            instrEl.innerText = this.instruction;
        }

        if (btnStart) {
            btnStart.innerHTML = this.isRunning ? '⏸ Pause' : '▶ Mulai';
            btnStart.className = this.isRunning ? 'btn btn-outline' : 'btn btn-green';
        }
    }
}

window.exerciseTimer = new ExerciseTimer();
