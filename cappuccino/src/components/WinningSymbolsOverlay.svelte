<script lang="ts">
	import { getContext } from '../game/context';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import BoardContainer from './BoardContainer.svelte';
	import Symbol from './Symbol.svelte';

	const context = getContext();
</script>

<BoardContainer>
	{#each context.stateGame.board as reel, reelIndex}
		{#each reel.reelState.symbols as reelSymbol, symbolIndex}
			{#if reelSymbol.symbolState === 'win'}
				<Symbol
					x={getSymbolX(reelIndex)}
					y={getSymbolY(symbolIndex - 1)}
					state="win"
					rawSymbol={reelSymbol.rawSymbol}
				/>
			{/if}
		{/each}
	{/each}
</BoardContainer>
