<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { BaseSprite } from 'pixi-svelte';

	type Props = {
		alias: 'big' | 'superwin' | 'mega' | 'epic' | 'max';
		width: number;
	};

	const props: Props = $props();
	const BANNER_URL = '/assets/spines/foregroundAnimation/coffee-win-banners.png';
	const bannerIndex = { big: 0, superwin: 1, mega: 2, epic: 3, max: 4 } as const;

	let sourceTexture = $state<PIXI.Texture>(PIXI.Texture.EMPTY);
	const bannerTexture = $derived.by(() => {
		if (sourceTexture === PIXI.Texture.EMPTY) return PIXI.Texture.EMPTY;
		const frameHeight = sourceTexture.height / 5;
		return new PIXI.Texture({
			source: sourceTexture.source,
			frame: new PIXI.Rectangle(0, frameHeight * bannerIndex[props.alias], sourceTexture.width, frameHeight),
		});
	});
	const height = $derived(
		bannerTexture === PIXI.Texture.EMPTY ? 0 : (props.width * bannerTexture.height) / bannerTexture.width,
	);

	onMount(() => {
		void PIXI.Assets.load<PIXI.Texture>(BANNER_URL).then((texture) => (sourceTexture = texture));
	});
</script>

{#if bannerTexture !== PIXI.Texture.EMPTY}
	<BaseSprite texture={bannerTexture} anchor={0.5} width={props.width} {height} />
{/if}
