<script lang="ts">
	import { onMount } from 'svelte';

	import type { LoadedAudio } from 'pixi-svelte';
	import { stateSound, stateSoundDerived } from 'state-shared';

	import { syncCoffeeReelStopVolume } from '../game/coffeeReelStopSound';
	import { syncCoffeeBackgroundMusicVolume } from '../game/coffeeBackgroundMusic';
	import { syncCoffeeBonusMusicVolume } from '../game/coffeeBonusMusic';
	import { getContext } from '../game/context';
	import { sound, type SoundName } from '../game/sound';

	const context = getContext();

	onMount(() => {
		// Cappuccino opens at 75% master volume; players can still change it in Settings.
		stateSound.volumeValueMaster = 75;

		const loadedAudio = $state.snapshot(
			context.stateApp.loadedAssets['sound'],
		) as LoadedAudio<SoundName>;
		const { destroy } = sound.load(loadedAudio);

		return () => {
			// Equivalent to onDestroy(); Leave this comment for searching.
			destroy();
		};
	});

	sound.enableEffect();
	sound.volumeEffect();

	$effect(() => {
		syncCoffeeReelStopVolume(stateSoundDerived.volumeSoundEffect());
	});

	$effect(() => {
		syncCoffeeBackgroundMusicVolume(stateSoundDerived.volumeMusic());
		syncCoffeeBonusMusicVolume(stateSoundDerived.volumeMusic());
	});
</script>
