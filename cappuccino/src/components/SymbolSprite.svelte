<script lang="ts">
	import { Sprite } from 'pixi-svelte';

	import { getSymbolInfo } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';

	type Props = {
		x?: number;
		y?: number;
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		oncomplete?: () => void;
		animatePulse?: boolean;
	};

	const PULSE_COUNT = 3;
	const PULSE_DURATION = 1060;
	const PULSE_SCALE = 0.5;

	const props: Props = $props();
	let scale = $state(1);

	$effect(() => {
		const { animatePulse, symbolInfo } = props;

		if (!animatePulse) {
			symbolInfo;
			scale = 1;
			props.oncomplete?.();
			return;
		}

		let frameId = 0;
		const startTime = performance.now();

		const tick = (time: number) => {
			const progress = Math.min((time - startTime) / PULSE_DURATION, 1);
			scale = 1 + Math.abs(Math.sin(progress * Math.PI * PULSE_COUNT)) * PULSE_SCALE;

			if (progress < 1) {
				frameId = requestAnimationFrame(tick);
				return;
			}

			scale = 1;
			props.oncomplete?.();
		};

		frameId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frameId);
			scale = 1;
		};
	});
</script>

<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	key={props.symbolInfo.assetKey}
	width={SYMBOL_SIZE * props.symbolInfo.sizeRatios.width * scale}
	height={SYMBOL_SIZE * props.symbolInfo.sizeRatios.height * scale}
/>
