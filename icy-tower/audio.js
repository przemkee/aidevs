const synth = new Tone.MonoSynth({
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.02, decay: 0.1, sustain: 0.2, release: 0.4 }
}).toDestination();

const bassSynth = new Tone.MonoSynth({
  oscillator: { type: 'square' },
  filter: { type: 'lowpass', frequency: 200 },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 }
}).toDestination();

const kick = new Tone.MembraneSynth().toDestination();

Tone.Transport.bpm.value = 160;

const melody = [
  'C4', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4',
  'D4', 'F4', 'A4', 'C5', 'D5', 'A4', 'F4', 'D4'
];

const bassline = ['C2', 'C2', 'G1', 'C2', 'B1', 'G1', 'C2', 'G1'];

const sequence = new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, '16n', time);
}, melody, '16n');

const bassSequence = new Tone.Sequence((time, note) => {
  bassSynth.triggerAttackRelease(note, '8n', time);
  kick.triggerAttackRelease('C2', '8n', time);
}, bassline, '8n');

sequence.loop = true;
bassSequence.loop = true;
Tone.Transport.loop = true;
Tone.Transport.loopEnd = '90s'; // roughly 1.5 minutes

export function startMusic() {
  Tone.start();
  if (sequence.state !== 'started') {
    sequence.start(0);
    bassSequence.start(0);
  }
  Tone.Transport.start();
}

export function stopMusic() {
  Tone.Transport.stop();
}
