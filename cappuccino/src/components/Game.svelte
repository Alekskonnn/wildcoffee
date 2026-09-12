<script lang="ts">
	import { onMount } from 'svelte';

	import { EnablePixiExtension } from 'components-pixi';
	import { EnableHotkey } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App, Container, Sprite, REM } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import { UiGameName } from 'components-ui-pixi';
	import { GameVersion, Modals } from 'components-ui-html';

	import { getContext } from '../game/context';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import Background from './Background.svelte';
	import CoffeeVideoOverlay from './CoffeeVideoOverlay.svelte';
	import CoffeeBlenderOverlay from './CoffeeBlenderOverlay.svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import BoardFrame from './BoardFrame.svelte';
	import Board from './Board.svelte';
	import Anticipations from './Anticipations.svelte';
	import Win from './Win.svelte';
	import FreeSpinIntro from './FreeSpinIntro.svelte';
	import FreeSpinCounter from './FreeSpinCounter.svelte';
	import FreeSpinOutro from './FreeSpinOutro.svelte';
	import Transition from './Transition.svelte';
	import I18nTest from './I18nTest.svelte';
	import CappuccinoUI from './CappuccinoUI.svelte';
	import WinningSymbolsOverlay from './WinningSymbolsOverlay.svelte';

	type Props = {
		mockBet?: () => Promise<void>;
		mobile?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const boardScale = 1;
	const boardScalePivot = $derived({
		x: context.stateGameDerived.boardLayout().x,
		y: context.stateGameDerived.boardLayout().y,
	});

	onMount(() => (context.stateLayout.showLoadingScreen = true));

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
	});
</script>

<App>
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor mockBet={props.mockBet} />
	<EnablePixiExtension />

	{#if !props.mobile}
		<Background />
	{/if}

	{#if context.stateLayout.showLoadingScreen}
		<LoadingScreen onloaded={() => (context.stateLayout.showLoadingScreen = false)} />
	{:else}
		<ResumeBet />
		<!--
			The reason why <Sound /> is rendered after clicking the loading screen:
			"Autoplay with sound is allowed if: The user has interacted with the domain (click, tap, etc.)."
			Ref: https://developer.chrome.com/blog/autoplay
		-->
		<Sound />

		<MainContainer>
			<Container
				x={boardScalePivot.x}
				y={boardScalePivot.y}
				scale={boardScale}
				pivot={boardScalePivot}
			>
				<Board />
			</Container>
		</MainContainer>

		{#if !props.mobile}
			<!-- The transparent reel windows in the foreground art sit above reels only. -->
			<Background foreground />
			<!-- Black in the video is visually transparent through screen blending. -->
			<CoffeeVideoOverlay />
			<CoffeeBlenderOverlay />
		{/if}
		<Container zIndex={20}>
			<Anticipations />
		</Container>

		{#if !props.mobile}
			<MainContainer>
				<Container
					x={boardScalePivot.x}
					y={boardScalePivot.y}
					scale={boardScale}
					pivot={boardScalePivot}
				>
					<BoardFrame />
				</Container>
			</MainContainer>
		{/if}

		<Container zIndex={100}>
			{#if !props.mobile}
				<CappuccinoUI>
					{#snippet gameName()}
						<UiGameName name="LINES GAME" />
					{/snippet}
					{#snippet logo()}
						<Sprite
							key="cappuccinoLogo"
							anchor={{ x: 1, y: 0 }}
							width={REM * 3.4}
							height={REM * 3.4}
						/>
					{/snippet}
				</CappuccinoUI>
			{/if}
			<Win />
			<FreeSpinIntro />
			<FreeSpinCounter />
			<FreeSpinOutro />
			<Transition />
		</Container>
		<MainContainer>
			<Container
				x={boardScalePivot.x}
				y={boardScalePivot.y}
				scale={boardScale}
				pivot={boardScalePivot}
				zIndex={100}
			>
				<WinningSymbolsOverlay />
			</Container>
		</MainContainer>

		{#if !props.mobile}
			<I18nTest />
		{/if}
	{/if}
</App>

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
</Modals>
