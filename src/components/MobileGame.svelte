<script lang="ts">
	import { stateBet, stateBetDerived } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';

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
			balance: { x: 35.5, y: 20, width: 29, scale: 1.3, textX: 50, textY: 66, textSize: 5.3 },
			bet: { x: 3, y: 20, width: 29, scale: 1.3, textX: 50, textY: 66, textSize: 5.3 },
			win: { x: 68, y: 20, width: 29, scale: 1.3, textX: 50, textY: 66, textSize: 5.3 },
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

</script>

<main class:controls-only={props.controlsOnly} class="coffee-scene" aria-label="Wild Coffee mobile game" style={sceneStyle}>
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
			<span>{numberToCurrencyString(stateBet.winBookEventAmount)}</span>
		</div>
	</section>
	<section class="game-controls" aria-label="Game controls">
		<button class="game-button bet-minus" type="button" aria-label="Decrease bet">
			<img src="/assets/mobile/buttons/bet-minus.png" alt="" />
		</button>
		<button class="game-button bet-plus" type="button" aria-label="Increase bet">
			<img src="/assets/mobile/buttons/bet-plus.png" alt="" />
		</button>
		<button class="game-button spin" type="button" aria-label="Spin" onclick={handleSpin}>
			<img src="/assets/mobile/buttons/spin.png" alt="" />
			<span>SPIN</span>
		</button>
		<button class="game-button auto" type="button" aria-label="Auto spin">
			<img src="/assets/mobile/buttons/auto.png" alt="" />
		</button>
		<button class="game-button info" type="button" aria-label="Game information">
			<img src="/assets/mobile/buttons/info.png" alt="" />
		</button>
	</section>
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
		background: #100704 url('/assets/mobile/wild-coffee-background.png') center / contain no-repeat fixed;
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
		width: min(100vw, 540px);
		margin: 0;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}
	.controls-only .game-controls { pointer-events: auto; }

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
</style>
