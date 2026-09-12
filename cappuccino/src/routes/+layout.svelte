<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { GlobalStyle } from 'components-ui-html';
	import { Authenticate, LoaderStakeEngine, LoaderExample, LoadI18n } from 'components-shared';
	import { stateBet, stateUi, stateUrlDerived } from 'state-shared';
	import Game from '../components/Game.svelte';
	import MobileGame from '../components/MobileGame.svelte';
	import { setContext } from '../game/context';
	import { playRandomBaseBook, playRandomBonusBook } from '../stories/mockBet';

	import messagesMap from '../i18n/messagesMap';

	type Props = { children: Snippet };

	const props: Props = $props();

	let showYourLoader = $state(false);
	let isMobileDevice = $state(false);

	const loaderUrlStakeEngine = new URL('../../stake-engine-loader.gif', import.meta.url).href;
	const loaderUrl = new URL('../../loader.gif', import.meta.url).href;
	const rgsUrl = $derived(stateUrlDerived.rgsUrl());
	const isLocalDemo = $derived(
		!rgsUrl || rgsUrl === 'bet' || rgsUrl === 'wallet' || !stateUrlDerived.sessionID(),
	);

	setContext();

	onMount(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');
		const updateDevice = () => (isMobileDevice = mediaQuery.matches);
		updateDevice();
		mediaQuery.addEventListener('change', updateDevice);
		return () => mediaQuery.removeEventListener('change', updateDevice);
	});

	// In local demo the RGS is not available, so the mock has to respect the
	// selected bet mode: buy bonus plays a bonus book instead of a base one.
	const mockBet = async () =>
		stateBet.activeBetModeKey.toUpperCase() === 'BONUS'
			? playRandomBonusBook()
			: playRandomBaseBook();

	$effect(() => {
		if (!isLocalDemo) return;

		stateUi.config.mode = 'default';
		stateBet.currency = 'USD';
		stateBet.balanceAmount = 1000000;
		stateBet.activeBetModeKey = 'BASE';
		if (stateBet.betAmount <= 0) stateBet.betAmount = 1;
		if (stateBet.wageredBetAmount <= 0) stateBet.wageredBetAmount = stateBet.betAmount;
	});
</script>

	{#if isMobileDevice}
		<GlobalStyle>
			{#if isLocalDemo}
				<LoadI18n {messagesMap}>
					<Game {mockBet} mobile />
				</LoadI18n>
			{:else}
				<Authenticate>
					<LoadI18n {messagesMap}>
						<Game mobile />
					</LoadI18n>
				</Authenticate>
			{/if}
		</GlobalStyle>
		<MobileGame controlsOnly />
	{:else}
		<GlobalStyle>
			{#if isLocalDemo}
			<LoadI18n {messagesMap}>
				<Game {mockBet} />
			</LoadI18n>
			{:else}
				<Authenticate>
					<LoadI18n {messagesMap}>
						<Game />
					</LoadI18n>
				</Authenticate>
			{/if}
		</GlobalStyle>

		<LoaderStakeEngine src={loaderUrlStakeEngine} oncomplete={() => (showYourLoader = true)} />

		{#if showYourLoader}
			<LoaderExample src={loaderUrl} />
		{/if}
	{/if}

{@render props.children()}
