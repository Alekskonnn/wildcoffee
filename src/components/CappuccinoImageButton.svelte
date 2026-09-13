<script lang="ts">
	import { Container, Rectangle, Sprite, Text } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';

	type Props = Partial<Omit<ButtonProps, 'children' | 'sizes' | 'onpress'>> & {
		label: string;
		sizes: { width: number; height: number };
		onpress: () => void;
		disabled?: boolean;
		active?: boolean;
		iconKey?: string;
		iconSizes?: { width: number; height: number };
		noBackground?: boolean;
	};

	const {
		label,
		sizes,
		onpress,
		disabled = false,
		active = false,
		iconKey,
		iconSizes = { width: 59, height: 58 },
		noBackground = false,
		...buttonProps
	}: Props = $props();
</script>

	<Button {...buttonProps} {sizes} {onpress} {disabled} softHover>
	{#snippet children({ center, hovered, pressed, hoverScale, hoverLift })}
		<Container x={center.x} y={center.y + hoverLift} scale={hoverScale}>
			{#if iconKey}
				<Sprite
					key={iconKey}
					anchor={0.5}
					{...iconSizes}
					alpha={disabled ? 0.5 : pressed ? 0.9 : hovered ? 0.95 : 1}
				/>
			{:else if noBackground}
				<Text
					anchor={0.5}
					text={label}
					style={{
						align: 'center',
						fontFamily: 'proxima-nova',
						fontWeight: '700',
						fontSize: Math.min(62, sizes.height * 1.4),
						lineHeight: Math.min(68, sizes.height * 1.6),
						fill: disabled ? 0x666666 : 0xffffff,
					}}
				/>
			{:else}
				<Rectangle
					anchor={0.5}
					width={sizes.width}
					height={sizes.height}
					backgroundColor={disabled ? 0x4c4c4c : active ? 0x7a4a15 : 0x120d08}
					backgroundAlpha={pressed ? 0.95 : hovered ? 0.9 : 0.82}
					borderWidth={active ? 5 : 3}
					borderColor={active ? 0xffd36a : 0xb97924}
				/>
				<Text
					anchor={0.5}
					text={label}
					style={{
						align: 'center',
						wordWrap: true,
						wordWrapWidth: sizes.width - 14,
						fontFamily: 'proxima-nova',
						fontWeight: '700',
						fontSize: Math.min(31, sizes.height * 0.34),
						lineHeight: Math.min(34, sizes.height * 0.38),
						fill: disabled ? 0xb9b9b9 : 0xffffff,
					}}
				/>
			{/if}
		</Container>
	{/snippet}
</Button>
