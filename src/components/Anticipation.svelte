<script lang="ts">
	import { onMount } from 'svelte';
	import { Container, Sprite } from 'pixi-svelte';

	import {
		ANTICIPATION_GLOW,
		DESKTOP_BACKGROUND_RATIO,
		MOBILE_ANTICIPATION_LAYOUT,
	} from '../game/constants';
	import { getContext } from '../game/context';
	import { stateMobileDebug } from '../game/mobileDebug.svelte';
	import type { Reel } from '../game/stateGame.svelte';

	type Props = {
		reel: Reel;
		oncomplete: () => void;
		preview?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	let completed = false;
	let time = $state(0);
	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const backgroundSizes = $derived.by(() => {
		const ratio = DESKTOP_BACKGROUND_RATIO;
		const canvasRatio = canvasSizes.width / canvasSizes.height;

		return canvasRatio > ratio
			? { width: canvasSizes.height * ratio, height: canvasSizes.height }
			: { width: canvasSizes.width, height: canvasSizes.width / ratio };
	});
	const isMobileLayout = $derived(context.stateLayoutDerived.layoutType() === 'portrait');
	const overlayLayout = $derived.by(() => {
		if (!isMobileLayout) {
			return { x: canvasSizes.width * 0.5, y: canvasSizes.height * 0.5, ...backgroundSizes };
		}

		return {
			x:
				canvasSizes.width * MOBILE_ANTICIPATION_LAYOUT.centerX +
				canvasSizes.width * stateMobileDebug.anticipationOffsetX,
			y:
				canvasSizes.height * MOBILE_ANTICIPATION_LAYOUT.centerY +
				canvasSizes.height * stateMobileDebug.anticipationOffsetY,
		width:
				canvasSizes.width *
				MOBILE_ANTICIPATION_LAYOUT.width *
				stateMobileDebug.anticipationScaleX,
		height:
				canvasSizes.height *
				MOBILE_ANTICIPATION_LAYOUT.height *
				stateMobileDebug.anticipationScaleY,
		};
	});
	const anticipationKey = $derived(`coffeeAnticipation${props.reel.reelIndex + 1}`);
	const glow = $derived.by(() => {
		const cycle = (Math.sin((time / ANTICIPATION_GLOW.cycleMs) * Math.PI * 2) + 1) * 0.5;

		return {
			alpha: ANTICIPATION_GLOW.minAlpha +
				(ANTICIPATION_GLOW.maxAlpha - ANTICIPATION_GLOW.minAlpha) * cycle,
			y: (cycle - 0.5) * backgroundSizes.height * ANTICIPATION_GLOW.verticalTravel,
		};
	});

	onMount(() => {
		let frame = 0;
		const animate = (nextTime: number) => {
			time = nextTime;
			frame = requestAnimationFrame(animate);
		};

		frame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (!props.preview && props.reel.reelState.motion === 'stopped' && !completed) {
			completed = true;
			props.oncomplete();
		}
	});
</script>

<Container x={overlayLayout.x} y={overlayLayout.y}>
	<Sprite
		key={anticipationKey}
		anchor={0.5}
		alpha={stateMobileDebug.anticipationOpacity}
		width={overlayLayout.width}
		height={overlayLayout.height}
		blendMode="screen"
	/>
	<Sprite
		key={anticipationKey}
		anchor={0.5}
		y={glow.y * (isMobileLayout ? stateMobileDebug.anticipationScaleY : 1)}
		alpha={glow.alpha * stateMobileDebug.anticipationOpacity}
		scale={1.01}
		width={overlayLayout.width}
		height={overlayLayout.height}
		blendMode="add"
	/>
</Container>
