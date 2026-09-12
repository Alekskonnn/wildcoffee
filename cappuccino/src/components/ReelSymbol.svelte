<script lang="ts">
	import Symbol from './Symbol.svelte';
	import SymbolWrap from './SymbolWrap.svelte';
	import { getSymbolInfo, getSymbolX } from '../game/utils';
	import type { ReelSymbol } from '../game/stateGame.svelte';
	import { BOARD_SIZES, REEL_BARREL_EFFECT, REEL_SYMBOL_SCALE } from '../game/constants';

	type Props = {
		reelIndex: number;
		reelSymbol: ReelSymbol;
	};

	const props: Props = $props();
	const symbolInfo = $derived(
		getSymbolInfo({ rawSymbol: props.reelSymbol.rawSymbol, state: props.reelSymbol.symbolState }),
	);
	const symbolY = $derived(props.reelSymbol.symbolY());
	const barrel = $derived.by(() => {
		const centreY = BOARD_SIZES.height * 0.5;
		const edgeRatio = Math.min(Math.abs(symbolY - centreY) / centreY, 1);
		const directionToCentre = symbolY < centreY ? 1 : -1;

		return {
			scale: {
				x: 1 - (1 - REEL_BARREL_EFFECT.edgeScaleX) * edgeRatio,
				y: 1 - (1 - REEL_BARREL_EFFECT.edgeScaleY) * edgeRatio,
			},
			alpha: 1 - (1 - REEL_BARREL_EFFECT.edgeAlpha) * edgeRatio,
			y: directionToCentre * REEL_BARREL_EFFECT.curveOffsetY * edgeRatio,
		};
	});
</script>

<SymbolWrap
	x={getSymbolX(props.reelIndex)}
	y={symbolY + barrel.y}
	scale={{
		x: barrel.scale.x * REEL_SYMBOL_SCALE,
		y: barrel.scale.y * REEL_SYMBOL_SCALE,
	}}
	alpha={props.reelSymbol.symbolState === 'win' ? 0 : barrel.alpha}
	animating={symbolInfo.type === 'spine' &&
		(props.reelSymbol.symbolState === 'land' || props.reelSymbol.symbolState === 'win')}
>
	<Symbol
		state={props.reelSymbol.symbolState}
		rawSymbol={props.reelSymbol.rawSymbol}
		oncomplete={() => {
			if (props.reelSymbol.symbolState === 'win') props.reelSymbol.oncomplete();
			if (props.reelSymbol.symbolState === 'land') props.reelSymbol.symbolState = 'static';
		}}
	/>
</SymbolWrap>
