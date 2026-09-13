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
</script>

{#if !props.foreground}
	<Rectangle {...context.stateLayoutDerived.canvasSizes()} backgroundColor={0x000000} zIndex={-3} />
{/if}
<Sprite key={backgroundKey} anchor={0.5} zIndex={props.foreground ? 0 : -2} {...backgroundProps} />
