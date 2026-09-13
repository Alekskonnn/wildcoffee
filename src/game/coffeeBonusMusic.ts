const MUSIC_VOLUME = 1;
let musicVolume = 1;
let shouldPlay = false;
let player: HTMLAudioElement | undefined;

const getPlayer = () => {
	if (typeof Audio === 'undefined') return;
	if (!player) {
		player = new Audio('/assets/audio/coffee-bonus-music.mp3');
		player.loop = true;
	}
	return player;
};

export const syncCoffeeBonusMusicVolume = (volume: number) => {
	musicVolume = volume;
	const audio = getPlayer();
	if (!audio) return;

	audio.volume = MUSIC_VOLUME * musicVolume;
	if (musicVolume === 0) audio.pause();
	if (shouldPlay && musicVolume > 0 && audio.paused) void audio.play().catch(() => undefined);
};

export const playCoffeeBonusMusic = () => {
	shouldPlay = true;
	const audio = getPlayer();
	if (!audio || musicVolume === 0) return;

	audio.volume = MUSIC_VOLUME * musicVolume;
	void audio.play().catch(() => undefined);
};

export const stopCoffeeBonusMusic = () => {
	shouldPlay = false;
	if (!player) return;
	player.pause();
	player.currentTime = 0;
};
