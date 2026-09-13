export default {
	menuButton: {
		type: 'sprite',
		src: new URL('../assets/ui/menu.webp', import.meta.url).href,
		preload: true,
	},
	buyBonusButton: {
		type: 'sprite',
		src: new URL('../assets/ui/buy-bonus-button-round.png', import.meta.url).href,
		preload: true,
	},
	spinButton: {
		type: 'sprite',
		src: new URL('../assets/ui/spin_button.png', import.meta.url).href,
		preload: true,
	},
	coffeeMenuButton: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-menu-button.png', import.meta.url).href,
		preload: true,
	},
	coffeeBuyBonusButton: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-buy-bonus-button.png', import.meta.url).href,
		preload: true,
	},
	coffeeMinusButton: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-minus-button.png', import.meta.url).href,
		preload: true,
	},
	coffeePlusButton: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-plus-button.png', import.meta.url).href,
		preload: true,
	},
	coffeeAutoButton: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-auto-button.png', import.meta.url).href,
		preload: true,
	},
	coffeeSpinButton: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-spin-button.png', import.meta.url).href,
		preload: true,
	},
	coffeeTurboButton: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-turbo-button.png', import.meta.url).href,
		preload: true,
	},
	coffeeBetHolder: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-bet-holder.png', import.meta.url).href,
		preload: true,
	},
	coffeeBalanceHolder: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-balance-holder.png', import.meta.url).href,
		preload: true,
	},
	coffeeWinHolder: {
		type: 'sprite',
		src: new URL('../assets/ui/coffee-win-holder.png', import.meta.url).href,
		preload: true,
	},
	infoButton: {
		type: 'sprite',
		src: new URL('../assets/ui/info_button.jpeg', import.meta.url).href,
		preload: true,
	},
	loader: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/loader/loader.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/loader/loader.json', import.meta.url).href,
			scale: 2,
		},
		preload: true,
	},
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url)
			.href,
		preload: true,
	},
	'h1.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/h1.png', import.meta.url).href,
	},
	'h2.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/h2.png', import.meta.url).href,
	},
	'h3.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/h3/h3.png', import.meta.url).href,
	},
	'h4.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/h4.png', import.meta.url).href,
	},
	'l1.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/l1.png', import.meta.url).href,
	},
	'l2.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/l2.png', import.meta.url).href,
	},
	'l3.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/l3.png', import.meta.url).href,
	},
	'l4.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/l4.png', import.meta.url).href,
	},
	'l5.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols/l5.png', import.meta.url).href,
	},
	'S.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols2/S.png', import.meta.url).href,
	},
	explosion: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/explosion.json', import.meta.url).href,
			scale: 2,
		},
	},
	'W.png': {
		type: 'sprite',
		src: new URL('../../assets/spines/symbols3/W.png', import.meta.url).href,
	},
	reelsFrame: {
		type: 'sprites',
		src: new URL('../../assets/sprites/reelsFrame/reels_frame.json', import.meta.url).href,
	},
	anticipation: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/anticipation/anticipation.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/anticipation/anticipation.json', import.meta.url).href,
			scale: 2,
		},
	},
	coffeeAnticipation1: {
		type: 'sprite',
		src: new URL('../../assets/spines/anticipation/coffee-anticipation-1.png', import.meta.url).href,
	},
	coffeeAnticipation2: {
		type: 'sprite',
		src: new URL('../../assets/spines/anticipation/coffee-anticipation-2.png', import.meta.url).href,
	},
	coffeeAnticipation3: {
		type: 'sprite',
		src: new URL('../../assets/spines/anticipation/coffee-anticipation-3.png', import.meta.url).href,
	},
	coffeeAnticipation4: {
		type: 'sprite',
		src: new URL('../../assets/spines/anticipation/coffee-anticipation-4.png', import.meta.url).href,
	},
	coffeeAnticipation5: {
		type: 'sprite',
		src: new URL('../../assets/spines/anticipation/coffee-anticipation-5.png', import.meta.url).href,
	},
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/goldFont/mm_gold.xml', import.meta.url).href,
	},
	goldBlur: {
		type: 'font',
		src: new URL('../../assets/fonts/goldBlur/miningfont_gold_blur.xml', import.meta.url).href,
	},
	silverFont: {
		type: 'font',
		src: new URL('../../assets/fonts/silverFont/mm_silver.xml', import.meta.url).href,
	},
	purpleFont: {
		type: 'font',
		src: new URL('../../assets/fonts/purpleFont/mm_purple.xml', import.meta.url).href,
	},
	bigwin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/bigwin/big_wins.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/bigwin/mm_bigwin.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsIntro: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsIntroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsOutroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_total_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	foregroundAnimationMobile: {
		type: 'sprite',
		src: new URL('../../assets/spines/foregroundAnimation/bg-mobile.png', import.meta.url).href,
		preload: true,
	},
	foregroundAnimationDesktop: {
		type: 'sprite',
		src: new URL('../../assets/spines/foregroundAnimation/bg-desktop.png', import.meta.url).href,
		preload: true,
	},
	foregroundAnimationDesktopBase: {
		type: 'sprite',
		src: new URL('../../assets/spines/foregroundAnimation/bg-desktop-base.png', import.meta.url)
			.href,
		preload: true,
	},
	wildcoffeeLogo: {
		type: 'sprite',
		src: new URL('../../assets/logo/wildcoffee-logo.png', import.meta.url).href,
		preload: true,
	},
	reelhouse: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/reelhouse/reelhouse_glow.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/reelhouse/reelhouse_glow.json', import.meta.url).href,
			scale: 2,
		},
	},
	progressBar: {
		type: 'sprites',
		src: new URL('../../assets/sprites/progressBar/progressBar.json', import.meta.url).href,
		preload: true,
	},
	freeSpins: {
		type: 'sprites',
		src: new URL('../../assets/sprites/freeSpins/freeSpins.json', import.meta.url).href,
	},
	winSmall: {
		type: 'sprites',
		src: new URL('../../assets/sprites/winSmall/MM_Localisation_winsmall.json', import.meta.url)
			.href,
	},
	coins: {
		type: 'spriteSheet',
		src: new URL('../../assets/sprites/coin/SD2_Coin.json', import.meta.url).href,
	},
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
