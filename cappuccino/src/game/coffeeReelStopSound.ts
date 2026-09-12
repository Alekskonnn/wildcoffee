const COFFEE_REEL_STOP_VOLUME = 0.55;
const activePlayers = new Set<HTMLAudioElement>();

let soundEffectsVolume = 1;

export const syncCoffeeReelStopVolume = (volume: number) => {
	soundEffectsVolume = volume;

	for (const audio of activePlayers) {
		audio.volume = COFFEE_REEL_STOP_VOLUME * soundEffectsVolume;
		if (soundEffectsVolume === 0) audio.pause();
	}
};

export const playCoffeeReelStop = () => {
	if (typeof Audio === 'undefined' || soundEffectsVolume === 0) return;

	const audio = new Audio('/assets/audio/coffee-reel-stop.mp3');
	audio.volume = COFFEE_REEL_STOP_VOLUME * soundEffectsVolume;
	activePlayers.add(audio);
	audio.addEventListener('ended', () => activePlayers.delete(audio), { once: true });
	void audio.play().catch(() => activePlayers.delete(audio));
};
