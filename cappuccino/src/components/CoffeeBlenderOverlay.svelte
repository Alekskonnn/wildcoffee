<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { BaseSprite, Container } from 'pixi-svelte';

	import { COFFEE_BLENDER_OVERLAY, DESKTOP_BACKGROUND_RATIO } from '../game/constants';
	import { getContext } from '../game/context';

	const context = getContext();
	const VIDEO_URL = '/assets/spines/foregroundAnimation/coffee-blender.webm';
	const BEANS_URL = '/assets/spines/foregroundAnimation/coffee-blender-beans.png';

	let texture = $state<PIXI.Texture>(PIXI.Texture.EMPTY);
	let beansTexture = $state<PIXI.Texture>(PIXI.Texture.EMPTY);
	let videoElement = $state<HTMLVideoElement>();
	let wasReelsMoving = false;
	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const reelsAreMoving = $derived(
		context.stateGame.board.some((reel) =>
			['spinning', 'bouncing'].includes(reel.reelState.motion),
		),
	);
	const backgroundSizes = $derived.by(() => {
		const ratio = DESKTOP_BACKGROUND_RATIO;
		const canvasRatio = canvasSizes.width / canvasSizes.height;

		return canvasRatio > ratio
			? { width: canvasSizes.height * ratio, height: canvasSizes.height }
			: { width: canvasSizes.width, height: canvasSizes.width / ratio };
	});
	const blenderLayout = $derived({
		x:
			(canvasSizes.width - backgroundSizes.width) * 0.5 +
			backgroundSizes.width * COFFEE_BLENDER_OVERLAY.centerX,
		y:
			(canvasSizes.height - backgroundSizes.height) * 0.5 +
			backgroundSizes.height * COFFEE_BLENDER_OVERLAY.centerY,
		width: backgroundSizes.width * COFFEE_BLENDER_OVERLAY.width,
		height: backgroundSizes.height * COFFEE_BLENDER_OVERLAY.height,
	});

	onMount(() => {
		let disposed = false;

		void (async () => {
			const loadedTexture = await PIXI.Assets.load<PIXI.Texture>({
				src: VIDEO_URL,
				data: { autoPlay: false, loop: true, muted: true, preload: true, updateFPS: 60 },
			});
			const loadedBeansTexture = await PIXI.Assets.load<PIXI.Texture>(BEANS_URL);
			const video = loadedTexture.source.resource;

			if (video instanceof HTMLVideoElement) {
				video.muted = true;
				video.loop = true;
				video.playsInline = true;
				video.pause();
				video.currentTime = 0;
				videoElement = video;
			}

			if (!disposed) {
				texture = loadedTexture;
				beansTexture = loadedBeansTexture;
			}
		})();

		return () => {
			disposed = true;
		};
	});

	$effect(() => {
		const video = videoElement;
		if (!video) return;

		if (reelsAreMoving && !wasReelsMoving) {
			video.currentTime = 0;
			void video.play().catch(() => undefined);
		}

		if (!reelsAreMoving && wasReelsMoving) {
			video.pause();
			video.currentTime = 0;
		}

		wasReelsMoving = reelsAreMoving;
	});
</script>

{#if texture !== PIXI.Texture.EMPTY}
	<Container x={blenderLayout.x} y={blenderLayout.y} zIndex={10} eventMode="none">
		<BaseSprite
			{texture}
			anchor={0.5}
			alpha={COFFEE_BLENDER_OVERLAY.opacity}
			tint={COFFEE_BLENDER_OVERLAY.tint}
			width={blenderLayout.width}
			height={blenderLayout.height}
		/>
		{#if beansTexture !== PIXI.Texture.EMPTY}
			<BaseSprite
				texture={beansTexture}
				anchor={0.5}
				width={blenderLayout.width}
				height={blenderLayout.height}
			/>
		{/if}
	</Container>
{/if}
