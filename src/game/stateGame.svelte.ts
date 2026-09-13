import _ from 'lodash';
import type { Tween } from 'svelte/motion';

import { stateBet } from 'state-shared';
import { createEnhanceBoard, createReelForSpinning } from 'utils-slots';
import { createGetWinLevelDataByWinLevelAlias } from 'utils-shared/winLevel';

import type { GameType, RawSymbol, SymbolState } from './types';
import { stateLayoutDerived } from './stateLayout';
import { winLevelMap } from './winLevelMap';
import { eventEmitter } from './eventEmitter';
import { playCoffeeReelStop } from './coffeeReelStopSound';
import {
	SYMBOL_SIZE,
	REEL_Y_PITCH,
	BASE_BOARD_SIZES,
	BOARD_SIZES,
	INITIAL_BOARD,
	BOARD_DIMENSIONS,
	SPIN_OPTIONS_DEFAULT,
	SPIN_OPTIONS_FAST,
	SPIN_OPTIONS_ANTICIPATED_FAST,
	INITIAL_SYMBOL_STATE,
	SCATTER_LAND_SOUND_MAP,
	REEL_BOARD_PLACEMENT,
	DESKTOP_BACKGROUND_RATIO,
	PORTRAIT_BACKGROUND_RATIO,
} from './constants';

const onSymbolLand = ({ rawSymbol }: { rawSymbol: RawSymbol }) => {
	if (rawSymbol.name === 'S') {
		eventEmitter.broadcast({ type: 'soundScatterCounterIncrease' });
		eventEmitter.broadcast({
			type: 'soundOnce',
			name: SCATTER_LAND_SOUND_MAP[scatterLandIndex()],
		});
	}

	if (rawSymbol.name === 'W') {
		eventEmitter.broadcast({
			type: 'soundOnce',
			name: 'sfx_multiplier_landing',
		});
	}
};

const board = _.range(BOARD_DIMENSIONS.x).map((reelIndex) => {
	const reel = createReelForSpinning({
		reelIndex,
		symbolHeight: REEL_Y_PITCH,
		initialSymbols: INITIAL_BOARD[reelIndex],
		initialSymbolState: INITIAL_SYMBOL_STATE,
		onReelStopping: () => {
			playCoffeeReelStop();
		},
		onSymbolLand,
	});

	reel.reelState.spinOptions = () => {
		if (reel.reelState.spinType === 'anticipated' && stateBet.isTurbo) {
			return SPIN_OPTIONS_ANTICIPATED_FAST;
		}

		return reel.reelState.spinType === 'fast' ? SPIN_OPTIONS_FAST : SPIN_OPTIONS_DEFAULT;
	};

	return reel;
});

export type Reel = (typeof board)[number];
export type ReelSymbol = Reel['reelState']['symbols'][number];

export type MultiplierSymbol = {
	initX: number;
	initY: number;
	symbolX: Tween<number>;
	symbolY: Tween<number>;
	rawSymbol: RawSymbol;
	symbolState: SymbolState;
	oncomplete: () => void;
};

export const stateGame = $state({
	board,
	gameType: 'basegame' as GameType,
	multiplierBoard: [] as (MultiplierSymbol | undefined)[][],
	scatterCounter: 0,
	skipWinPresentations: false,
});

const boardLayout = () => {
	const mainLayout = stateLayoutDerived.mainLayout();
	const isPortrait = stateLayoutDerived.layoutType() === 'portrait';
	const placement =
		isPortrait
			? REEL_BOARD_PLACEMENT.portrait
			: REEL_BOARD_PLACEMENT.desktop;

	// Match the exact contained rectangle used by Background.svelte, rather than
	// the canvas itself. This keeps the reels locked to the artwork on every resize.
	const canvasSizes = stateLayoutDerived.canvasSizes();
	const canvasRatio = canvasSizes.width / canvasSizes.height;
	const backgroundRatio = isPortrait ? PORTRAIT_BACKGROUND_RATIO : DESKTOP_BACKGROUND_RATIO;
	const backgroundSizes =
		canvasRatio > backgroundRatio
			? { width: canvasSizes.height * backgroundRatio, height: canvasSizes.height }
			: { width: canvasSizes.width, height: canvasSizes.width / backgroundRatio };
	const baseRenderWidth = (backgroundSizes.width * placement.width) / mainLayout.scale;
	const scale = baseRenderWidth / BASE_BOARD_SIZES.width;
	const renderWidth = BOARD_SIZES.width * scale;
	const renderHeight = BOARD_SIZES.height * scale;
	const x =
		mainLayout.width * 0.5 +
		(backgroundSizes.width * (placement.centerX - 0.5)) / mainLayout.scale;
	const y =
		mainLayout.height * 0.5 +
		(backgroundSizes.height * (placement.centerY - 0.5)) / mainLayout.scale;

	return {
		x,
		y,
		anchor: { x: 0.5, y: 0.5 },
		pivot: { x: BOARD_SIZES.width / 2, y: BOARD_SIZES.height / 2 },
		scale,
		renderWidth,
		renderHeight,
		...BOARD_SIZES,
	};
};

const boardRaw = () =>
	board.map((reel) => reel.reelState.symbols.map((reelSymbol) => reelSymbol.rawSymbol));

const scatterLandIndex = () => {
	if (stateGame.scatterCounter > 5) return 5;
	if (stateGame.scatterCounter < 1) return 1;
	return stateGame.scatterCounter as 1 | 2 | 3 | 4 | 5;
};

const { enhanceBoard } = createEnhanceBoard();
const enhancedBoard = enhanceBoard({ board: stateGame.board });

export const { getWinLevelDataByWinLevelAlias } = createGetWinLevelDataByWinLevelAlias({
	winLevelMap,
});

export const stateGameDerived = {
	onSymbolLand,
	boardLayout,
	boardRaw,
	scatterLandIndex,
	enhancedBoard,
	getWinLevelDataByWinLevelAlias,
};
