<script lang="ts">
	import { Rectangle, Sprite } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { DESKTOP_BACKGROUND_RATIO } from '../game/constants';

	type Props = {
		foreground?: boolean;
	};

	const props: Props = $props();
	const context = getContext();

	const containBackground = ({
		canvasWidth,
		canvasHeight,
		ratio,
	}: {
		canvasWidth: number;
		canvasHeight: number;
		ratio: number;
	}) => {
		const canvasRatio = canvasWidth / canvasHeight;

		if (canvasRatio > ratio) {
			const height = canvasHeight;
			return { width: height * ratio, height };
		}

		const width = canvasWidth;
		return { width, height: width / ratio };
	};

	// Fills the whole canvas (cropping edges) — used for the backdrop that
	// replaces the black letterbox bars around the contained artwork.
	const coverBackground = ({
		canvasWidth,
		canvasHeight,
		ratio,
	}: {
		canvasWidth: number;
		canvasHeight: number;
		ratio: number;
	}) => {
		const canvasRatio = canvasWidth / canvasHeight;

		if (canvasRatio > ratio) {
			const width = canvasWidth;
			return { width, height: width / ratio };
		}

		const height = canvasHeight;
		return { width: height * ratio, height };
	};

	const backgroundKey = $derived(
		props.foreground ? 'foregroundAnimationDesktop' : 'foregroundAnimationDesktopBase',
	);
	const backgroundProps = $derived.by(() => {
		const { width, height } = context.stateLayoutDerived.canvasSizes();
		const sizes = containBackground({
			canvasWidth: width,
			canvasHeight: height,
			ratio: DESKTOP_BACKGROUND_RATIO,
		});

		return {
			x: width * 0.5,
			y: height * 0.5,
			...sizes,
		};
	});
	// Darkened, slightly zoomed copy of the same art fills the letterbox bars
	// so the scene visually extends to the screen edges on any aspect ratio.
	const backdropProps = $derived.by(() => {
		const { width, height } = context.stateLayoutDerived.canvasSizes();
		const sizes = coverBackground({
			canvasWidth: width,
			canvasHeight: height,
			ratio: DESKTOP_BACKGROUND_RATIO,
		});

		return {
			x: width * 0.5,
			y: height * 0.5,
			width: sizes.width * 1.15,
			height: sizes.height * 1.15,
		};
	});
</script>

{#if !props.foreground}
	<Rectangle {...context.stateLayoutDerived.canvasSizes()} backgroundColor={0x000000} zIndex={-4} />
	<Sprite key={backgroundKey} anchor={0.5} zIndex={-3} tint={0x4f4038} {...backdropProps} />
{/if}
<Sprite key={backgroundKey} anchor={0.5} zIndex={props.foreground ? 0 : -2} {...backgroundProps} />
