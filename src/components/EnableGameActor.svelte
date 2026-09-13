<script lang="ts">
	import { onMount } from 'svelte';

	import { Text } from 'pixi-svelte';
	import { stateSlots } from 'utils-slots';
	import { stateBetDerived } from 'state-shared';

	import { gameActor } from '../game/actor';
	import { getContext } from '../game/context';

	type Props = {
		debug?: boolean;
		mockBet?: () => Promise<void>;
	};

	const props: Props = $props();
	const context = getContext();
	let queueBetAfterAnticipationStop = false;
	let winPresentationActive = false;
	let winPresentationAllowsNextBet = false;

	const hasAnticipation = () => context.stateGame.board.some((reel) => reel.reelState.anticipating);

	onMount(() => {
		const { unsubscribe } = gameActor.subscribe((snapshot) => {
			context.stateXstate.value = snapshot.value;
			if (queueBetAfterAnticipationStop && snapshot.matches('idle')) {
				queueBetAfterAnticipationStop = false;
				if (stateBetDerived.isBetCostAvailable()) void bet();
			}
			// const childActor = snapshot.children[snapshot.value];
		});

		gameActor.start();
		gameActor.send({ type: 'RENDERED' });

		return () => {
			// Equivalent to onDestroy(); Leave this comment for searching.
			unsubscribe();
			gameActor.stop();
		};
	});

	let mockBetRunning = false;

	const bet = async () => {
		if (!props.mockBet) {
			gameActor.send({ type: 'BET' });
			return;
		}

		if (mockBetRunning) return;
		mockBetRunning = true;
		try {
			await props.mockBet();
		} finally {
			mockBetRunning = false;
		}
	};

	context.eventEmitter.subscribeOnMount({
		// Connect every actor with app.eventEmitter to avoid call actor directly
		bet,
		winPresentationStart: ({ allowNextBet }) => {
			winPresentationActive = true;
			winPresentationAllowsNextBet = allowNextBet;
		},
		winPresentationEnd: () => {
			winPresentationActive = false;
			winPresentationAllowsNextBet = false;
		},
		stopButtonClick: () => {
			if (winPresentationActive) {
				context.stateGame.skipWinPresentations = true;
				if (winPresentationAllowsNextBet) {
					queueBetAfterAnticipationStop = true;
				}
				context.eventEmitter.broadcast({ type: 'winPresentationSkip' });
			} else if (hasAnticipation() || stateSlots.skipAnticipation) {
				queueBetAfterAnticipationStop = true;
			}
		},
		autoBet: () => gameActor.send({ type: 'AUTO_BET' }),
		resumeBet: () => gameActor.send({ type: 'RESUME_BET' }),
	});
</script>

{#if props.debug}
	<Text
		x={context.stateLayoutDerived.canvasSizes().width}
		anchor={{ x: 1, y: 0 }}
		style={{ fill: 0xffffff }}
		text={JSON.stringify(context.stateXstate.value, undefined, 2)}
	/>
{/if}
