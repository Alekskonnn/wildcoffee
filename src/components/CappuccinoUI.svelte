<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { Tween } from 'svelte/motion';

	import { OnHotkey, EnableSpaceHold } from 'components-shared';
	import { FadeContainer } from 'components-pixi';
	import { MainContainer } from 'components-layout';
	import { Container, Rectangle, Sprite, Text, anchorToPivot } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateConfig, stateModal, stateUi } from 'state-shared';
	import { numberToCurrencyString, bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import { COFFEE_CONTROL_LAYOUT, DESKTOP_BACKGROUND_RATIO } from '../game/constants';
	import { getContext } from '../game/context';
	import { goHome } from '../game/goHome';
	import CappuccinoImageButton from './CappuccinoImageButton.svelte';

	type Props = {
		gameName: Snippet;
		logo: Snippet;
	};

	const props: Props = $props();
	const context = getContext();
	const uiLayout = $derived(context.stateLayoutDerived.mainLayout());

	const ROW_WIDTH = 1570;
	const ROW_HEIGHT = 112;
	const BUTTON_HEIGHT = 78;
	const SMALL_BUTTON_WIDTH = 108;
	const WIDE_BUTTON_WIDTH = 144;
	const SPIN_BUTTON_WIDTH = 176;
	const SPIN_BUTTON_HEIGHT = 96;
	const STACK_BUTTON_WIDTH = 86;
	const STACK_BUTTON_HEIGHT = 36;

	let show = $state(true);
	let oncomplete = $state(() => {});
	let stopDisabled = $state(false);
	let chalkFontReady = $state(false);
	let betHovered = $state(false);

	const balanceTween = new Tween(stateBet.balanceAmount);
	const betHoverScale = new Tween(1, { duration: 150 });
	const betHoverLift = new Tween(0, { duration: 150 });

	const betButtonDisabled = $derived(
		context.stateXstateDerived.isIdle() ? !stateBetDerived.isBetCostAvailable() : stopDisabled,
	);
	const betButtonLabel = $derived(context.stateXstateDerived.isIdle() ? 'SPIN' : 'STOP');
	const buyBonusDisabled = $derived(!context.stateXstateDerived.isIdle());
	const buyBonusActive = $derived(stateBetDerived.activeBetMode()?.type === 'activate');
	const autoSpinActive = $derived(stateBetDerived.hasAutoBetCounter());
	const autoSpinDisabled = $derived.by(() => {
		if (stateBet.isSpaceHold) return true;
		if (!context.stateXstateDerived.isIdle() && !stateBetDerived.hasAutoBetCounter()) return true;
		if (!stateBetDerived.isBetCostAvailable()) return true;
		return false;
	});
	const turboDisabled = $derived(stateBet.isSpaceHold);
	const increaseDisabled = $derived(
		!context.stateXstateDerived.isIdle() ||
			stateBet.betAmount === stateConfig.betAmountOptions[stateConfig.betAmountOptions.length - 1],
	);
	const decreaseDisabled = $derived(
		!context.stateXstateDerived.isIdle() || stateBet.betAmount === stateConfig.betAmountOptions[0],
	);

	// Bind the controls directly to the contained coffee-background rectangle.
	// This stays correct even when the browser aspect ratio changes dramatically.
	const controlsLayout = $derived.by(() => {
		const { width: canvasWidth, height: canvasHeight } = context.stateLayoutDerived.canvasSizes();
		const canvasRatio = canvasWidth / canvasHeight;
		const backgroundHeight =
			canvasRatio > DESKTOP_BACKGROUND_RATIO ? canvasHeight : canvasWidth / DESKTOP_BACKGROUND_RATIO;
		const backgroundWidth = backgroundHeight * DESKTOP_BACKGROUND_RATIO;
		const scale = backgroundWidth / 1672;
		const offsetX = (canvasWidth - backgroundWidth) * 0.5;
		const offsetY = (canvasHeight - backgroundHeight) * 0.5;

		return {
			x: offsetX + backgroundWidth * 0.5,
			rowY: offsetY + backgroundHeight - (ROW_HEIGHT + 12) * scale,
			menuX: offsetX + 42 * scale,
			menuY: offsetY + backgroundHeight - (ROW_HEIGHT + 444) * scale,
			scale,
		};
	});

	$effect(() => balanceTween.set(stateBet.balanceAmount));
	$effect(() => {
		betHoverScale.set(betHovered ? 1.08 : 1);
		betHoverLift.set(betHovered ? -10 : 0);
	});

	onMount(() => {
		const chalkFont = new FontFace('Chalk Board', "url('/assets/fonts/chalk-board.ttf')");

		void chalkFont.load().then((loadedFont) => {
			document.fonts.add(loadedFont);
			chalkFontReady = true;
		});
	});

	context.eventEmitter.subscribeOnMount({
		// Both handlers are idempotent (as in the canonical UiFadeContainer):
		// a redundant uiShow/uiHide must resolve immediately, otherwise the
		// FadeContainer never re-runs its fade and the awaited promise hangs.
		uiShow: async () => {
			if (show) return;
			show = true;
			await new Promise<void>((resolve) => (oncomplete = resolve));
		},
		uiHide: async () => {
			if (!show) return;
			show = false;
			await new Promise<void>((resolve) => (oncomplete = resolve));
		},
		stopButtonClick: () => (stopDisabled = true),
		stopButtonEnable: () => (stopDisabled = false),
		drawerFold: () => (stateUi.menuOpen = false),
		// Cappuccino controls are fixed; the legacy drawer event must not open the menu overlay.
		drawerUnfold: () => (stateUi.menuOpen = false),
	});

	const emitGeneralPress = () => context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

	const pressBet = () => {
		context.eventEmitter.broadcast({ type: 'soundPressBet' });

		if (context.stateXstateDerived.isIdle()) {
			if (stateBetDerived.activeBetMode()?.type === 'buy') stateBet.activeBetModeKey = 'BASE';
			context.eventEmitter.broadcast({ type: 'bet' });
			return;
		}

		if (stateBetDerived.hasAutoBetCounter()) stateBet.autoSpinsCounter = 0;
		context.eventEmitter.broadcast({ type: 'stopButtonClick' });
	};

	const pressBuyBonus = () => {
		emitGeneralPress();
		if (buyBonusActive) {
			stateBet.activeBetModeKey = 'BASE';
			return;
		}
		stateModal.modal = { name: 'buyBonus' };
	};

	const pressAutoSpin = () => {
		emitGeneralPress();
		if (stateBetDerived.hasAutoBetCounter()) {
			stateBet.autoSpinsCounter = 0;
			return;
		}
		stateModal.modal = { name: 'autoSpin' };
	};

	const pressTurbo = () => {
		emitGeneralPress();
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	const pressIncrease = () => {
		emitGeneralPress();
		const biggest = stateConfig.betAmountOptions[stateConfig.betAmountOptions.length - 1];
		const nextBigger = [...stateConfig.betAmountOptions]
			.sort((a, b) => a - b)
			.find((option) => option > stateBet.betAmount);
		stateBetDerived.setBetAmount(nextBigger || biggest);
	};

	const pressDecrease = () => {
		emitGeneralPress();
		const smallest = stateConfig.betAmountOptions[0];
		const nextSmaller = [...stateConfig.betAmountOptions]
			.sort((a, b) => b - a)
			.find((option) => option < stateBet.betAmount);
		stateBetDerived.setBetAmount(nextSmaller || smallest);
	};

	const openBetAmountMenu = () => {
		if (!context.stateXstateDerived.isIdle()) return;
		emitGeneralPress();
		stateModal.modal = { name: 'betAmountMenu' };
	};
</script>

<EnableSpaceHold />
<OnHotkey hotkey="Space" disabled={betButtonDisabled} onpress={pressBet} />

<FadeContainer persistent {show} {oncomplete}>
	<MainContainer>
		<Container x={20} y={20}>
			{@render props.gameName()}
		</Container>

		<Container x={uiLayout.width - 20} y={20}>
			{@render props.logo()}
		</Container>
	</MainContainer>

	<Container
		x={controlsLayout.x}
		y={controlsLayout.rowY}
		scale={controlsLayout.scale}
			pivot={anchorToPivot({
				anchor: { x: 0.5, y: 0 },
				sizes: { width: ROW_WIDTH, height: ROW_HEIGHT },
			})}
	>
			{#snippet amountText(
				value: string,
				holderKey: 'coffeeBalanceHolder' | 'coffeeBetHolder' | 'coffeeWinHolder',
				layout: (typeof COFFEE_CONTROL_LAYOUT)[keyof typeof COFFEE_CONTROL_LAYOUT],
				onpress?: () => void,
			)}
				{@const isBetHolder = holderKey === 'coffeeBetHolder'}
				<Container
					x={layout.x}
					y={layout.y + (isBetHolder ? betHoverLift.current : 0)}
					eventMode={onpress ? 'static' : 'none'}
					cursor={onpress ? 'pointer' : 'auto'}
					onpointerup={onpress}
					onpointerover={() => {
						if (isBetHolder) betHovered = true;
					}}
					onpointerout={() => {
						if (isBetHolder) betHovered = false;
					}}
				>
					<Container x={100} scale={layout.scale * (isBetHolder ? betHoverScale.current : 1)}>
						<Sprite anchor={0.5} key={holderKey} width={280} height={210} />
						<Text
							y={32}
							anchor={0.5}
							text={value}
							style={{
								align: 'center',
								fontFamily: chalkFontReady ? 'Chalk Board' : 'proxima-nova',
								fontWeight: 'normal',
								fontSize: 27,
								fill: 0xffffff,
							}}
						/>
					</Container>
				</Container>
			{/snippet}

			<Container {...COFFEE_CONTROL_LAYOUT.menu}>
				<CappuccinoImageButton
					label=""
					iconKey="coffeeMenuButton"
					iconSizes={{ width: 96, height: 96 }}
					sizes={{ width: SMALL_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
					onpress={() => {
						emitGeneralPress();
						stateUi.menuOpen = true;
					}}
				/>
			</Container>

			<Container {...COFFEE_CONTROL_LAYOUT.buyBonus}>
				<CappuccinoImageButton
					label=""
					iconKey="coffeeBuyBonusButton"
					iconSizes={{ width: 166, height: 166 }}
					sizes={{ width: WIDE_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
					disabled={buyBonusDisabled}
					active={buyBonusActive}
					onpress={pressBuyBonus}
				/>
			</Container>

			{@render amountText(
				numberToCurrencyString(balanceTween.current),
				'coffeeBalanceHolder',
				COFFEE_CONTROL_LAYOUT.balance,
			)}
			{@render amountText(
				numberToCurrencyString(stateBetDerived.betCost()),
				'coffeeBetHolder',
				COFFEE_CONTROL_LAYOUT.bet,
				openBetAmountMenu,
			)}

			{@render amountText(
				bookEventAmountToCurrencyString(stateBet.winBookEventAmount),
				'coffeeWinHolder',
				COFFEE_CONTROL_LAYOUT.win,
			)}

			<Container {...COFFEE_CONTROL_LAYOUT.plus}>
				<CappuccinoImageButton
					label=""
					iconKey="coffeePlusButton"
					iconSizes={{ width: 48, height: 48 }}
					sizes={{ width: STACK_BUTTON_WIDTH, height: STACK_BUTTON_HEIGHT }}
					disabled={increaseDisabled}
					onpress={pressIncrease}
				/>
			</Container>
			<Container {...COFFEE_CONTROL_LAYOUT.minus}>
				<CappuccinoImageButton
					label=""
					iconKey="coffeeMinusButton"
					iconSizes={{ width: 48, height: 48 }}
					sizes={{ width: STACK_BUTTON_WIDTH, height: STACK_BUTTON_HEIGHT }}
					disabled={decreaseDisabled}
					onpress={pressDecrease}
				/>
			</Container>

			<Container {...COFFEE_CONTROL_LAYOUT.auto}>
				<CappuccinoImageButton
					label=""
					iconKey="coffeeAutoButton"
					iconSizes={{ width: 132, height: 72 }}
					sizes={{ width: SMALL_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
					disabled={autoSpinDisabled}
					active={autoSpinActive}
					onpress={pressAutoSpin}
				/>
			</Container>

			<Container {...COFFEE_CONTROL_LAYOUT.spin}>
				<CappuccinoImageButton
					label=""
					iconKey={betButtonLabel === 'SPIN' ? 'coffeeSpinButton' : undefined}
					iconSizes={{ width: 184, height: 178 }}
					sizes={{ width: SPIN_BUTTON_WIDTH, height: SPIN_BUTTON_HEIGHT }}
					disabled={betButtonDisabled}
					onpress={pressBet}
				/>
			</Container>

			<Container {...COFFEE_CONTROL_LAYOUT.turbo}>
				<CappuccinoImageButton
					label=""
					iconKey="coffeeTurboButton"
					iconSizes={{ width: 132, height: 72 }}
					sizes={{ width: SMALL_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
					disabled={turboDisabled}
					active={stateBet.isTurbo}
					onpress={pressTurbo}
				/>
			</Container>
	</Container>

	{#if stateUi.menuOpen}
		<Rectangle
			eventMode="static"
			cursor="pointer"
			alpha={0.5}
			anchor={0.5}
			backgroundColor={0x000000}
			width={context.stateLayoutDerived.canvasSizes().width}
			height={context.stateLayoutDerived.canvasSizes().height}
			x={context.stateLayoutDerived.canvasSizes().width * 0.5}
			y={context.stateLayoutDerived.canvasSizes().height * 0.5}
			onpointerup={() => (stateUi.menuOpen = false)}
		/>

		<Container
			x={controlsLayout.menuX}
			y={controlsLayout.menuY}
			scale={controlsLayout.scale}
		>
				<CappuccinoImageButton
					label={context.i18nDerived.payTable()}
					sizes={{ width: WIDE_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
					onpress={() => {
						emitGeneralPress();
						stateModal.modal = { name: 'payTable' };
					}}
				/>
				<Container y={92}>
					<CappuccinoImageButton
						label={context.i18nDerived.gameRules()}
						sizes={{ width: WIDE_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
						onpress={() => {
							emitGeneralPress();
							stateModal.modal = { name: 'gameRules' };
						}}
					/>
				</Container>
				<Container y={184}>
					<CappuccinoImageButton
						label={context.i18nDerived.settings()}
						sizes={{ width: WIDE_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
						onpress={() => {
							emitGeneralPress();
							stateModal.modal = { name: 'settings' };
						}}
					/>
				</Container>
				<Container y={276}>
					<CappuccinoImageButton
						label={context.i18nDerived.home()}
						sizes={{ width: WIDE_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
						onpress={() => {
							emitGeneralPress();
							goHome();
						}}
					/>
				</Container>
				<Container y={368}>
					<CappuccinoImageButton
						label={context.i18nDerived.close()}
						sizes={{ width: WIDE_BUTTON_WIDTH, height: BUTTON_HEIGHT }}
						onpress={() => {
							emitGeneralPress();
							stateUi.menuOpen = false;
						}}
					/>
				</Container>
		</Container>
	{/if}
</FadeContainer>
