<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { BaseSprite } from 'pixi-svelte';

	import { DESKTOP_BACKGROUND_RATIO } from '../game/constants';
	import { getContext } from '../game/context';

	type Props = {
		oncomplete: () => void;
	};

	const TRANSITION_DURATION = 950;
	const CURTAIN_URL = '/assets/spines/foregroundAnimation/coffee-curtains.png';

	const props: Props = $props();
	const context = getContext();

	let leftCurtainTexture = $state<PIXI.Texture>(PIXI.Texture.EMPTY);
	let rightCurtainTexture = $state<PIXI.Texture>(PIXI.Texture.EMPTY);
	const animationState = $state({ progress: 0, done: false });

	const easeInOut = (progress: number) =>
		progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

	const transitionProps = $derived.by(() => {
		const { width: canvasWidth, height: canvasHeight } = context.stateLayoutDerived.canvasSizes();
		const canvasRatio = canvasWidth / canvasHeight;
		const height = canvasRatio > DESKTOP_BACKGROUND_RATIO ? canvasHeight : canvasWidth / DESKTOP_BACKGROUND_RATIO;
		const width = height * DESKTOP_BACKGROUND_RATIO;
		const offsetX = (canvasWidth - width) * 0.5;
		const offsetY = (canvasHeight - height) * 0.5;
		const progress = animationState.progress;
		const closeProgress = easeInOut(Math.min(progress / 0.36, 1));
		const openProgress = easeInOut(Math.max((progress - 0.64) / 0.36, 0));
		const curtainProgress = Math.max(0, closeProgress - openProgress);
		const panelWidth = width * 0.5;
		const leftX = offsetX + width * 0.5 * curtainProgress;
		const rightX = offsetX + width - width * 0.5 * curtainProgress;
		const alpha = progress < 0.08 ? progress / 0.08 : progress > 0.92 ? (1 - progress) / 0.08 : 1;

		return { height, offsetY, panelWidth, leftX, rightX, alpha };
	});

	onMount(() => {
		let disposed = false;

		void PIXI.Assets.load<PIXI.Texture>(CURTAIN_URL).then((texture) => {
			if (disposed) return;

			const halfWidth = texture.width / 2;
			// One supplied image, split exactly down the centre into two independently moving panels.
			leftCurtainTexture = new PIXI.Texture({
				source: texture.source,
				frame: new PIXI.Rectangle(0, 0, halfWidth, texture.height),
			});
			rightCurtainTexture = new PIXI.Texture({
				source: texture.source,
				frame: new PIXI.Rectangle(halfWidth, 0, halfWidth, texture.height),
			});
		});

		return () => {
			disposed = true;
		};
	});

	$effect(() => {
		if (leftCurtainTexture === PIXI.Texture.EMPTY || rightCurtainTexture === PIXI.Texture.EMPTY) return;

		let frameId = 0;
		const startTime = performance.now();

		const tick = (time: number) => {
			animationState.progress = Math.min((time - startTime) / TRANSITION_DURATION, 1);

			if (animationState.progress < 1) {
				frameId = requestAnimationFrame(tick);
				return;
			}

			animationState.done = true;
			props.oncomplete();
		};

		frameId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frameId);
		};
	});
</script>

{#if !animationState.done && leftCurtainTexture !== PIXI.Texture.EMPTY && rightCurtainTexture !== PIXI.Texture.EMPTY}
	{@const data = transitionProps}
	<BaseSprite
		texture={leftCurtainTexture}
		x={data.leftX}
		y={data.offsetY}
		width={data.panelWidth}
		height={data.height}
		anchor={{ x: 1, y: 0 }}
		alpha={data.alpha}
		zIndex={20}
	/>
	<BaseSprite
		texture={rightCurtainTexture}
		x={data.rightX}
		y={data.offsetY}
		width={data.panelWidth}
		height={data.height}
		anchor={{ x: 0, y: 0 }}
		alpha={data.alpha}
		zIndex={20}
	/>
{/if}
