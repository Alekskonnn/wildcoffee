<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { BaseSprite, Container } from 'pixi-svelte';

	import { COFFEE_VIDEO_OVERLAY, DESKTOP_BACKGROUND_RATIO } from '../game/constants';
	import { getContext } from '../game/context';

	const context = getContext();
	const VIDEO_URL = '/assets/spines/foregroundAnimation/coffee-overlay.mp4';
	const featherFilter = PIXI.Filter.from({
		gl: {
			vertex: `
				in vec2 aPosition;
				out vec2 vTextureCoord;
				uniform vec4 uInputSize;
				uniform vec4 uOutputFrame;
				uniform vec4 uOutputTexture;
				void main(void) {
					vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
					gl_Position = vec4(
						position.x * (2.0 / uOutputTexture.x) - 1.0,
						position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z,
						0.0,
						1.0
					);
					vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
				}
			`,
			fragment: `
				in vec2 vTextureCoord;
				out vec4 finalColor;
				uniform sampler2D uTexture;
				void main(void) {
					const float feather = ${COFFEE_VIDEO_OVERLAY.edgeFade};
					float xFade = smoothstep(0.0, feather, vTextureCoord.x)
						* smoothstep(0.0, feather, 1.0 - vTextureCoord.x);
					float yFade = smoothstep(0.0, feather, vTextureCoord.y)
						* smoothstep(0.0, feather, 1.0 - vTextureCoord.y);
					finalColor = texture(uTexture, vTextureCoord) * xFade * yFade;
				}
			`,
		},
		resolution: 0.5,
	});

	let texture = $state<PIXI.Texture>(PIXI.Texture.EMPTY);
	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const backgroundSizes = $derived.by(() => {
		const ratio = DESKTOP_BACKGROUND_RATIO;
		const canvasRatio = canvasSizes.width / canvasSizes.height;

		if (canvasRatio > ratio) {
			return { width: canvasSizes.height * ratio, height: canvasSizes.height };
		}

		return { width: canvasSizes.width, height: canvasSizes.width / ratio };
	});
	const videoLayout = $derived({
		x:
			(canvasSizes.width - backgroundSizes.width) * 0.5 +
			backgroundSizes.width * COFFEE_VIDEO_OVERLAY.centerX,
		y:
			(canvasSizes.height - backgroundSizes.height) * 0.5 +
			backgroundSizes.height * COFFEE_VIDEO_OVERLAY.centerY,
		width: backgroundSizes.width * COFFEE_VIDEO_OVERLAY.width,
		height: backgroundSizes.height * COFFEE_VIDEO_OVERLAY.height,
	});

	onMount(() => {
		let disposed = false;

		void (async () => {
			const loadedTexture = await PIXI.Assets.load<PIXI.Texture>({
				src: VIDEO_URL,
				data: { autoPlay: true, loop: true, muted: true, preload: true, updateFPS: 60 },
			});
			const video = loadedTexture.source.resource;

			if (video instanceof HTMLVideoElement) {
				video.muted = true;
				video.loop = true;
				video.playsInline = true;
				video.playbackRate = 1;
				void video.play().catch(() => undefined);
			}

			if (!disposed) {
				texture = loadedTexture;
			}
		})();

		return () => {
			disposed = true;
		};
	});
</script>

{#if texture !== PIXI.Texture.EMPTY}
	<Container
		x={videoLayout.x}
		y={videoLayout.y}
	>
		<BaseSprite
			{texture}
			anchor={0.5}
			alpha={COFFEE_VIDEO_OVERLAY.opacity}
			blendMode="screen"
			filters={[featherFilter]}
			width={videoLayout.width}
			height={videoLayout.height}
		/>
	</Container>
{/if}
