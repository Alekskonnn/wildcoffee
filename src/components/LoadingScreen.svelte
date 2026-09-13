<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { BaseSprite, Container, Sprite } from 'pixi-svelte';
	import { FadeContainer, LoadingProgress } from 'components-pixi';
	import { MainContainer } from 'components-layout';

	import { getContext } from '../game/context';
	import TransitionAnimation from './TransitionAnimation.svelte';
	import PressToContinue from './PressToContinue.svelte';

	type Props = {
		onloaded: () => void;
		mobile?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const LOADING_VIDEO_URL = '/assets/spines/foregroundAnimation/loading-animation.webm';
	const LOADING_VIDEO_WIDTH = 1100;

	let loadingType = $state<'start' | 'transition'>('start');
	let loadingTexture = $state<PIXI.Texture>(PIXI.Texture.EMPTY);
	let loadingVideo = $state<HTMLVideoElement>();
	const loadingVideoHeight = $derived(
		loadingTexture === PIXI.Texture.EMPTY
			? LOADING_VIDEO_WIDTH
			: (LOADING_VIDEO_WIDTH * loadingTexture.height) / loadingTexture.width,
	);

	onMount(() => {
		if (props.mobile) return;

		let disposed = false;
		void PIXI.Assets.load<PIXI.Texture>({
			src: LOADING_VIDEO_URL,
			data: { autoPlay: true, loop: true, muted: true, preload: true, updateFPS: 60 },
		}).then((texture) => {
			const video = texture.source.resource;
			if (video instanceof HTMLVideoElement) {
				video.muted = true;
				video.loop = true;
				video.playsInline = true;
				void video.play().catch(() => undefined);
				loadingVideo = video;
			}

			if (!disposed) loadingTexture = texture;
		});

		return () => {
			disposed = true;
			loadingVideo?.pause();
		};
	});
</script>

<!-- HTML animation avoids mobile WebM alpha-decoding issues. -->
{#if props.mobile && loadingType === 'start'}
	<div class="loading-logo" aria-hidden="true">
		<img src="/assets/spines/foregroundAnimation/loading-logo.png" alt="" />
	</div>
{/if}

<!-- loading progress -->
<FadeContainer show={loadingType === 'start'}>
	<MainContainer>
		<Container
			x={context.stateLayoutDerived.mainLayout().width * 0.5}
			 y={context.stateLayoutDerived.mainLayout().height * 0.5}
		>
			{#if !props.mobile && loadingTexture !== PIXI.Texture.EMPTY}
				<BaseSprite
					texture={loadingTexture}
					anchor={0.5}
					width={LOADING_VIDEO_WIDTH}
					height={loadingVideoHeight}
				/>
			{/if}
			{#if !context.stateApp.loaded}
				<LoadingProgress y={250} width={1967 * 0.2} height={346 * 0.2}>
					{#snippet background(sizes)}
						<Sprite key="progressBarBackground.png" {...sizes} />
					{/snippet}
					{#snippet progress(sizes)}
						<Sprite key="progressBar.png" {...sizes} />
					{/snippet}
					{#snippet frame(sizes)}
						<Sprite key="progressBarFrame.png" {...sizes} />
					{/snippet}
				</LoadingProgress>
			{/if}
		</Container>
	</MainContainer>
</FadeContainer>

<!-- press to continue -->
<FadeContainer show={loadingType === 'start' && context.stateApp.loaded}>
	<PressToContinue onpress={() => (loadingType = 'transition')} />
</FadeContainer>

<!-- transition between the loading screen and the game -->
<FadeContainer show={loadingType === 'transition'}>
	<TransitionAnimation oncomplete={props.onloaded} />
</FadeContainer>

<style>
	.loading-logo {
		position: fixed;
		inset: 0;
		z-index: 4;
		display: grid;
		place-items: center;
		pointer-events: none;
	}

	.loading-logo img {
		width: min(76vw, 460px);
		height: auto;
		mix-blend-mode: screen;
		transform-origin: center;
		animation: loading-logo-pulse 2.4s ease-in-out infinite;
	}

	@keyframes loading-logo-pulse {
		0%,
		100% {
			transform: scale(0.96);
		}
		50% {
			transform: scale(1.04);
		}
	}
</style>
