<script lang="ts">
	import { stateBet, stateBetDerived, stateConfig, stateModal } from 'state-shared';
	import { numberToCurrencyString, bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';
<<<<<<< HEAD
	import { stateMobileDebug } from '../game/mobileDebug.svelte';
	import { winLevelMap, type WinLevel } from '../game/winLevelMap';
=======
	import { goHome } from '../game/goHome';
>>>>>>> 210ae35 (Add translation)

	const context = getContext();

	type Props = { controlsOnly?: boolean };
	const props: Props = $props();

	// Mobile scene editor. All values are percentages of the background image,
	// so they keep their place while the mobile game scales.
	const MOBILE_LAYOUT = {
		sockets: { scale: 1.15 },
		buttons: {
			betMinus: { x: 15, y: 88.5, size: 13 },
			betPlus: { x: 28.1, y: 88.5, size: 13 },
			spin: { x: 50, y: 88.5, size: 28 },
			auto: { x: 71.9, y: 88.5, size: 13 },
			info: { x: 85, y: 88.5, size: 13 },
		},
		blackboards: {
			top: 62,
			height: 22,
			balance: { x: 35.5, y: 20, width: 29, scale: 1.3, textX: 50, textY: 56, textSize: 5.3 },
			bet: { x: 3, y: 20, width: 29, scale: 1.3, textX: 50, textY: 56, textSize: 5.3 },
			win: { x: 68, y: 20, width: 29, scale: 1.3, textX: 50, textY: 56, textSize: 5.3 },
		},
		reels: {
			x: 50,
			y: 51,
			width: 88,
			height: 30,
			columnGap: 3, // % of the reel-board width
			rowGap: 1, // % of the reel-board height
		},
		spinText: { x: 50, y: 50, size: 5, letterSpacing: 1 },
	} as const;

	const boardStyle = (board: (typeof MOBILE_LAYOUT.blackboards)[keyof Omit<typeof MOBILE_LAYOUT.blackboards, 'top' | 'height'>]) =>
		`left:${board.x}%;top:${board.y}%;width:${board.width}%;transform:scale(${board.scale});--amount-x:${board.textX}%;--amount-y:${board.textY}%;--amount-size:${board.textSize}cqw;`;

	const sceneStyle = `
		--socket-scale:${MOBILE_LAYOUT.sockets.scale};
		--bet-minus-size:${MOBILE_LAYOUT.buttons.betMinus.size}%; --bet-minus-x:${MOBILE_LAYOUT.buttons.betMinus.x}%; --bet-minus-y:${MOBILE_LAYOUT.buttons.betMinus.y}%;
		--bet-plus-size:${MOBILE_LAYOUT.buttons.betPlus.size}%; --bet-plus-x:${MOBILE_LAYOUT.buttons.betPlus.x}%; --bet-plus-y:${MOBILE_LAYOUT.buttons.betPlus.y}%;
		--spin-size:${MOBILE_LAYOUT.buttons.spin.size}%; --spin-x:${MOBILE_LAYOUT.buttons.spin.x}%; --spin-y:${MOBILE_LAYOUT.buttons.spin.y}%;
		--auto-size:${MOBILE_LAYOUT.buttons.auto.size}%; --auto-x:${MOBILE_LAYOUT.buttons.auto.x}%; --auto-y:${MOBILE_LAYOUT.buttons.auto.y}%;
		--info-size:${MOBILE_LAYOUT.buttons.info.size}%; --info-x:${MOBILE_LAYOUT.buttons.info.x}%; --info-y:${MOBILE_LAYOUT.buttons.info.y}%;
		--spin-text-x:${MOBILE_LAYOUT.spinText.x}%; --spin-text-y:${MOBILE_LAYOUT.spinText.y}%; --spin-text-size:${MOBILE_LAYOUT.spinText.size}cqw; --spin-text-spacing:${MOBILE_LAYOUT.spinText.letterSpacing}cqw;
	`;

	const reelSymbols = $derived(
		context.stateGame.board.map((reel) => reel.reelState.symbols.slice(1, 4)),
	);
	const reelsAreSpinning = $derived(
		context.stateGame.board.some((reel) => ['spinning', 'bouncing'].includes(reel.reelState.motion)),
	);
	const isReelSpinning = (reelIndex: number) =>
		['spinning', 'bouncing'].includes(context.stateGame.board[reelIndex].reelState.motion);

	const handleSpin = () =>
		context.eventEmitter.broadcast({ type: reelsAreSpinning ? 'stopButtonClick' : 'bet' });
	const previewWin = (level: WinLevel) => {
		stateMobileDebug.previewAllAnticipations = false;
		const winLevelData = winLevelMap[level];
		context.eventEmitter.broadcast({ type: 'winShow' });
		context.eventEmitter.broadcast({
			type: 'winUpdate',
			amount: level * 100,
			winLevelData,
		});
	};
	const closeWinPreview = () => context.eventEmitter.broadcast({ type: 'winHide' });
	const playBonusSpin = () => {
		stateBet.activeBetModeKey = 'BONUS';
		context.eventEmitter.broadcast({ type: 'bet' });
	};

	const emitGeneralPress = () => context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

	const betOptions = $derived([...stateConfig.betAmountOptions].sort((a, b) => a - b));
	const betMinusDisabled = $derived(
		betOptions.length === 0 || stateBet.betAmount <= betOptions[0],
	);
	const betPlusDisabled = $derived(
		betOptions.length === 0 || stateBet.betAmount >= betOptions[betOptions.length - 1],
	);

	const handleBetMinus = () => {
		emitGeneralPress();
		const nextSmaller = [...betOptions].reverse().find((option) => option < stateBet.betAmount);
		stateBetDerived.setBetAmount(nextSmaller ?? betOptions[0]);
	};

	const handleBetPlus = () => {
		emitGeneralPress();
		const nextBigger = betOptions.find((option) => option > stateBet.betAmount);
		stateBetDerived.setBetAmount(nextBigger ?? betOptions[betOptions.length - 1]);
	};

	const handleAuto = () => {
		emitGeneralPress();
		if (stateBetDerived.hasAutoBetCounter()) {
			stateBet.autoSpinsCounter = 0;
			return;
		}
		stateModal.modal = { name: 'autoSpin' };
	};

	let menuOpen = $state(false);

	const handleInfo = () => {
		emitGeneralPress();
		menuOpen = !menuOpen;
	};

	const openModal = (name: 'payTable' | 'gameRules' | 'settings') => {
		emitGeneralPress();
		menuOpen = false;
		stateModal.modal = { name };
	};

	// While the Pixi loading screen is up, the HTML controls must not swallow
	// taps — "press anywhere to continue" is handled inside the canvas.
	const loading = $derived(context.stateLayout.showLoadingScreen);

	// Mirror the desktop UI: hide the controls during canvas-driven presentations
	// (free spin intro/outro, big wins). They need "press anywhere" taps to reach
	// the canvas; visible controls would swallow them and hang the book playback.
	let uiHidden = $state(false);
	context.eventEmitter.subscribeOnMount({
		uiShow: () => {
			uiHidden = false;
		},
		uiHide: () => {
			uiHidden = true;
		},
	});
</script>

<main class:controls-only={props.controlsOnly} class:loading={loading || uiHidden} class="coffee-scene" aria-label="Wild Coffee mobile game" style={sceneStyle}>
	{#if !props.controlsOnly}
		<img class="background-art" src="/assets/mobile/wild-coffee-background.png" alt="" />
	{/if}
	<div class="button-sockets" aria-hidden="true">
		<img src="/assets/mobile/button-sockets.png" alt="" />
	</div>
	{#if !props.controlsOnly}<section
		class="mobile-reels"
		aria-label="Slot reels"
		style={`left:${MOBILE_LAYOUT.reels.x}%;top:${MOBILE_LAYOUT.reels.y}%;width:${MOBILE_LAYOUT.reels.width}%;height:${MOBILE_LAYOUT.reels.height}%;--reel-column-gap:${MOBILE_LAYOUT.reels.columnGap}%;--reel-row-gap:${MOBILE_LAYOUT.reels.rowGap}%;`}
	>
		{#each reelSymbols as reel, reelIndex (reelIndex)}
			<div class:spinning={isReelSpinning(reelIndex)} class="mobile-reel">
				<div class="mobile-reel-strip">
					{#each [0, 1, 2] as repeat}
						{#each reel as symbol, rowIndex (`${repeat}-${rowIndex}`)}
							<div class:reel-edge={rowIndex !== 1} class="mobile-symbol">
								<img src={`/assets/spines/symbols/${symbol.rawSymbol.name.toLowerCase()}.png`} alt="" />
							</div>
						{/each}
					{/each}
				</div>
			</div>
		{/each}
	</section>{/if}
	<section class="scoreboards" aria-label="Game amounts" style={`top:${MOBILE_LAYOUT.blackboards.top}%;height:${MOBILE_LAYOUT.blackboards.height}%;`}>
		<div class="scoreboard" style={boardStyle(MOBILE_LAYOUT.blackboards.balance)}>
			<img src="/assets/mobile/balance-holder.png" alt="Balance" />
			<span>{numberToCurrencyString(stateBet.balanceAmount)}</span>
		</div>
		<div class="scoreboard" style={boardStyle(MOBILE_LAYOUT.blackboards.bet)}>
			<img src="/assets/mobile/bet-holder.png" alt="Bet" />
			<span>{numberToCurrencyString(stateBetDerived.betCost())}</span>
		</div>
		<div class="scoreboard" style={boardStyle(MOBILE_LAYOUT.blackboards.win)}>
			<img src="/assets/mobile/win-holder.png" alt="Win" />
			<span>{bookEventAmountToCurrencyString(stateBet.winBookEventAmount)}</span>
		</div>
	</section>
	<section class="game-controls" aria-label="Game controls">
		<button class="game-button bet-minus" type="button" aria-label="Decrease bet" disabled={betMinusDisabled} onclick={handleBetMinus}>
			<img src="/assets/mobile/buttons/bet-minus.png" alt="" />
		</button>
		<button class="game-button bet-plus" type="button" aria-label="Increase bet" disabled={betPlusDisabled} onclick={handleBetPlus}>
			<img src="/assets/mobile/buttons/bet-plus.png" alt="" />
		</button>
		<button class="game-button spin" type="button" aria-label="Spin" onclick={handleSpin}>
			<img src="/assets/mobile/buttons/spin.png" alt="" />
			<span>{context.i18nDerived.spin()}</span>
		</button>
		<button class="game-button auto" type="button" aria-label="Auto spin" class:menu-active={stateBetDerived.hasAutoBetCounter()} onclick={handleAuto}>
			<img src="/assets/mobile/buttons/auto.png" alt="" />
		</button>
		<button class="game-button info" type="button" aria-label="Game menu" class:menu-active={menuOpen} onclick={handleInfo}>
			<img src="/assets/mobile/buttons/info.png" alt="" />
		</button>
		{#if menuOpen}
			<nav class="mobile-menu" aria-label="Game menu">
				<button type="button" onclick={() => openModal('payTable')}>{context.i18nDerived.payTable()}</button>
				<button type="button" onclick={() => openModal('gameRules')}>{context.i18nDerived.gameRules()}</button>
				<button type="button" onclick={() => openModal('settings')}>{context.i18nDerived.settings()}</button>
				<button type="button" onclick={() => { emitGeneralPress(); goHome(); }}>{context.i18nDerived.home()}</button>
			</nav>
		{/if}
	</section>
	<button
		class="debug-toggle"
		type="button"
		onclick={() => (stateMobileDebug.open = !stateMobileDebug.open)}
	>
		DEBUG
	</button>
	{#if stateMobileDebug.open}
		<aside class="debug-panel" aria-label="Mobile visual debug controls">
			<div class="debug-panel-heading">
				<strong>Mobile debug</strong>
				<button type="button" onclick={() => (stateMobileDebug.open = false)}>×</button>
			</div>
			<div class="debug-actions">
				<button type="button" onclick={() => (stateMobileDebug.previewAllAnticipations = !stateMobileDebug.previewAllAnticipations)}>
					{stateMobileDebug.previewAllAnticipations ? 'Hide anticipation' : 'All anticipation lines'}
				</button>
				<button type="button" onclick={closeWinPreview}>Hide win</button>
			</div>
			<label>Anticipation size X <input type="range" min="0.5" max="1.5" step="0.01" bind:value={stateMobileDebug.anticipationScaleX} /></label>
			<label>Anticipation size Y <input type="range" min="0.5" max="1.5" step="0.01" bind:value={stateMobileDebug.anticipationScaleY} /></label>
			<label>Anticipation X <input type="range" min="-0.3" max="0.3" step="0.01" bind:value={stateMobileDebug.anticipationOffsetX} /></label>
			<label>Anticipation Y <input type="range" min="-0.3" max="0.3" step="0.01" bind:value={stateMobileDebug.anticipationOffsetY} /></label>
			<label>Anticipation opacity <input type="range" min="0" max="1" step="0.01" bind:value={stateMobileDebug.anticipationOpacity} /></label>
			<div class="debug-actions">
				<button type="button" onclick={handleSpin}>Base spin</button>
				<button type="button" onclick={playBonusSpin}>Bonus spin</button>
			</div>
			<div class="debug-wins">
				{#each [6, 7, 8, 9, 10] as level}
					<button type="button" onclick={() => previewWin(level as WinLevel)}>{winLevelMap[level as WinLevel].text}</button>
				{/each}
			</div>
		</aside>
	{/if}
</main>

<style>
	@font-face {
		font-family: 'Chalk Board';
		src: url('/assets/fonts/chalk-board.ttf') format('truetype');
	}

	:global(html),
	:global(body) {
		min-height: 100dvh;
		margin: 0;
		background: #100704 url('/assets/mobile/wild-coffee-background.png') center / cover no-repeat fixed;
	}

	.coffee-scene {
		width: min(100%, 540px);
		aspect-ratio: 941 / 1672;
		position: relative;
		margin-inline: auto;
		overflow: hidden;
	}
	.coffee-scene.controls-only {
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 10;
		/* This exactly matches `background-size: contain` on the portrait artwork.
		   On a short viewport, the height drives the scale; on a tall viewport, width does. */
		width: min(100vw, calc(100dvh * 0.5628), 540px);
		margin: 0;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}
	.controls-only .game-controls { pointer-events: none; }
	.controls-only .game-button { pointer-events: auto; }

	.coffee-scene { transition: opacity 300ms ease; }
	.coffee-scene.loading { opacity: 0; pointer-events: none; }
	.coffee-scene.loading .game-controls { pointer-events: none; }

	.background-art { display: block; width: 100%; height: 100%; }
	.button-sockets { position: absolute; z-index: 1; bottom: 0; left: 50%; width: calc(var(--socket-scale) * 100%); transform: translateX(-50%); pointer-events: none; }
	.button-sockets img, .game-button img { display: block; width: 100%; height: 100%; object-fit: contain; user-select: none; }
	.mobile-reels { position: absolute; z-index: 1; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); column-gap: var(--reel-column-gap); transform: translate(-50%, -50%); pointer-events: none; }
	.mobile-reel { overflow: hidden; border-radius: .6cqw; background: transparent; }
	.mobile-reel-strip { display: grid; grid-template-rows: repeat(9, minmax(0, 1fr)); row-gap: var(--reel-row-gap); height: 300%; }
	.mobile-reel.spinning .mobile-reel-strip { animation: mobile-reel-spin 180ms linear infinite; filter: blur(1.5px); }
	.mobile-reel:nth-child(2).spinning .mobile-reel-strip { animation-delay: -35ms; }
	.mobile-reel:nth-child(3).spinning .mobile-reel-strip { animation-delay: -70ms; }
	.mobile-reel:nth-child(4).spinning .mobile-reel-strip { animation-delay: -105ms; }
	.mobile-reel:nth-child(5).spinning .mobile-reel-strip { animation-delay: -140ms; }
	.mobile-symbol { display: grid; place-items: center; min-height: 0; padding: 2%; background: transparent; }
	.mobile-symbol img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; }
	.mobile-symbol.reel-edge { opacity: .82; transform: scale(.92); filter: brightness(.82); }
	@keyframes mobile-reel-spin { to { transform: translateY(-33.333%); } }
	.scoreboards { position: absolute; z-index: 2; top: 64%; left: 0; width: 100%; height: 22%; pointer-events: none; }
	.scoreboard { position: absolute; text-align: center; transform-origin: center top; }
	.scoreboard img { display: block; width: 100%; height: auto; }
	.scoreboard span { position: absolute; top: var(--amount-y); left: var(--amount-x); width: 86%; transform: translateX(-50%); color: #fff; font-family: 'Chalk Board', system-ui, sans-serif; font-size: var(--amount-size); line-height: 1; text-shadow: 0 1px 2px #000; }
	.game-controls { position: absolute; inset: 0; z-index: 2; }
	.game-button { position: absolute; width: var(--button-size); top: var(--button-y); left: var(--button-x); aspect-ratio: 1; padding: 0; border: 0; background: transparent; transform: translate(-50%, -50%); transition: transform 150ms cubic-bezier(.2, .8, .2, 1), filter 150ms ease; }
	.game-button:active { filter: brightness(.82) saturate(.9); transform: translate(-50%, -50%) scale(.94); }
	.spin span { position: absolute; left: var(--spin-text-x); top: var(--spin-text-y); transform: translate(-50%, -50%); color: #fff0ca; font: 700 var(--spin-text-size) / 1 system-ui, sans-serif; letter-spacing: var(--spin-text-spacing); text-shadow: 0 2px 3px #1a0802, 0 0 8px #8c3507; pointer-events: none; }
	.bet-minus { --button-size: var(--bet-minus-size); --button-x: var(--bet-minus-x); --button-y: var(--bet-minus-y); }
	.bet-plus { --button-size: var(--bet-plus-size); --button-x: var(--bet-plus-x); --button-y: var(--bet-plus-y); }
	.spin { --button-size: var(--spin-size); --button-x: var(--spin-x); --button-y: var(--spin-y); }
	.auto { --button-size: var(--auto-size); --button-x: var(--auto-x); --button-y: var(--auto-y); }
	.info { --button-size: var(--info-size); --button-x: var(--info-x); --button-y: var(--info-y); }
<<<<<<< HEAD
	.debug-toggle { position: absolute; z-index: 4; top: 2%; right: 2%; pointer-events: auto; border: 1px solid #e5a43c; border-radius: .7cqw; background: #210c05e6; color: #ffe0a0; font: 700 2.4cqw / 1 system-ui, sans-serif; padding: .8cqw 1.2cqw; }
	.debug-panel { position: absolute; z-index: 5; top: 7%; left: 3%; width: 58%; max-height: 48%; overflow: auto; box-sizing: border-box; pointer-events: auto; border: 1px solid #d8902d; border-radius: 1.4cqw; background: #160906f2; color: #ffe8ba; padding: 2cqw; font: 2.3cqw / 1.25 system-ui, sans-serif; box-shadow: 0 .6cqw 2cqw #000; }
	.debug-panel-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.4cqw; font-size: 2.8cqw; }
	.debug-panel button { border: 1px solid #a75e1a; border-radius: .8cqw; background: #47200d; color: #fff0c8; padding: .9cqw; font: inherit; }
	.debug-panel-heading button { font-size: 3.4cqw; line-height: .8; }
	.debug-panel label { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 1cqw; margin-top: 1cqw; }
	.debug-panel input { width: 100%; accent-color: #e6a02e; }
	.debug-actions, .debug-wins { display: flex; flex-wrap: wrap; gap: 1cqw; margin: 1.2cqw 0; }
	.debug-wins button { flex: 1 1 28%; }
=======
	.game-button:disabled { filter: grayscale(.7) brightness(.6); }
	.game-button.menu-active { filter: brightness(1.25) drop-shadow(0 0 6px #ffb45e); }
	.mobile-menu { position: absolute; right: 4%; bottom: 19%; display: flex; flex-direction: column; gap: 2cqw; padding: 3cqw; border: 1px solid #8c5a34; border-radius: 3cqw; background: rgba(24, 10, 4, .94); box-shadow: 0 4px 18px rgba(0, 0, 0, .6); }
	.mobile-menu button { padding: 2.4cqw 5cqw; border: 1px solid #6d4326; border-radius: 2cqw; background: #2e1509; color: #ffe9c2; font-family: 'Chalk Board', system-ui, sans-serif; font-size: 4.2cqw; letter-spacing: .05em; text-align: center; }
	.mobile-menu button:active { background: #4a2410; }
>>>>>>> 210ae35 (Add translation)
</style>
