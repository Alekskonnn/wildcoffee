import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 120;

export const REEL_PADDING = 0.53;

// Extra empty space, in design pixels, between reel columns (x) and symbol rows (y).
// Increase either value to spread the reels apart; use a negative value to bring them closer.
export const REEL_GAP = { x: 12, y: 11 } as const;
export const REEL_X_PITCH = SYMBOL_SIZE + REEL_GAP.x;
export const REEL_Y_PITCH = SYMBOL_SIZE + REEL_GAP.y;

// Gives each reel a subtle casino-style barrel profile as symbols move away from the centre.
// Lower edge scales make the top and bottom rows feel further back.
export const REEL_BARREL_EFFECT = {
	edgeScaleX: 0.94,
	edgeScaleY: 0.84,
	edgeAlpha: 0.82,
	curveOffsetY: 0,
} as const;

// Resizes symbols within their existing reel slots without changing the board size or spacing.
export const REEL_SYMBOL_SCALE = 0.9;

// initial board (padded top and bottom)
export const INITIAL_BOARD: RawSymbol[][] = [
	[
		{
			name: 'L2',
		},
		{
			name: 'L1',
		},
		{
			name: 'L4',
		},
		{
			name: 'H2',
		},
		{
			name: 'L1',
		},
	],
	[
		{
			name: 'H1',
		},
		{
			name: 'L5',
		},
		{
			name: 'L2',
		},
		{
			name: 'H3',
		},
		{
			name: 'L4',
		},
	],
	[
		{
			name: 'L3',
		},
		{
			name: 'L5',
		},
		{
			name: 'L3',
		},
		{
			name: 'H4',
		},
		{
			name: 'L4',
		},
	],
	[
		{
			name: 'H4',
		},
		{
			name: 'H3',
		},
		{
			name: 'L4',
		},
		{
			name: 'L5',
		},
		{
			name: 'L1',
		},
	],
	[
		{
			name: 'H3',
		},
		{
			name: 'L3',
		},
		{
			name: 'L3',
		},
		{
			name: 'H1',
		},
		{
			name: 'H1',
		},
	],
];

export const BOARD_DIMENSIONS = { x: INITIAL_BOARD.length, y: INITIAL_BOARD[0].length - 2 };

// The original 5×3 symbol grid. Placement width is based on this size so gaps
// expand the board around its centre without shrinking individual symbols.
export const BASE_BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y,
};

export const BOARD_SIZES = {
	width: REEL_X_PITCH * BOARD_DIMENSIONS.x,
	height: REEL_Y_PITCH * BOARD_DIMENSIONS.y,
};

export const BACKGROUND_RATIO = 2039 / 1000;
export const PORTRAIT_BACKGROUND_RATIO = 1242 / 2208;
export const DESKTOP_BACKGROUND_RATIO = 1672 / 941;
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

// Reel-board placement is expressed as a fraction of the background layout.
// Change centerX / centerY to move the reels, and width to resize them.
// 0 = left/top edge, 0.5 = centre, 1 = right/bottom edge.
export const REEL_BOARD_PLACEMENT = {
	desktop: { centerX: 0.5, centerY: 0.5, width: 0.5 },
	portrait: { centerX: 0.5, centerY: 0.51, width: 0.88 },
} as const;

// Video placement on the coffee artwork. Values are fractions of the artwork size.
// 0.5 is centred; width/height of 1 fills the artwork.
export const COFFEE_VIDEO_OVERLAY = {
	centerX: 0.19,
	centerY: 0.54,
	width: 0.27,
	height: 0.4,
	opacity: 0.7,
	edgeFade: 0.1,
} as const;

// Coffee Blender WebM placement, anchored to the contained coffee artwork.
export const COFFEE_BLENDER_OVERLAY = {
	centerX: 0.5,
	centerY: 0.5,
	width: 1,
	height: 1,
	opacity: 1,
	// Safe Pixi tint for the WebM: 0xRRGGBB. Use 0xffffff for the original colours.
	tint: 'white',
} as const;

// Presentation controls for effects that sit on top of the reel board.
export const WIN_ANIMATION_WIDTH_MULTIPLIER = 1.2;
export const ANTICIPATION_SIZE_MULTIPLIER = 1;
export const ANTICIPATION_GLOW = {
	minAlpha: 0.12,
	maxAlpha: 0.6,
	verticalTravel: 0.008,
	cycleMs: 600,
} as const;

export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

const SPIN_OPTIONS_SHARED = {
	reelBounceBackSpeed: 0.15,
	reelSpinSpeedBeforeBounce: 4,
	reelPaddingMultiplierNormal: 1.2,
	reelPaddingMultiplierAnticipated: 10,
	reelSpinDelay: 145,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	reelPreSpinSpeed: 2,
	reelSpinSpeed: 3,
	reelBounceSizeMulti: 0.3,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	reelPreSpinSpeed: 5,
	reelSpinSpeed: 5,
	reelBounceSizeMulti: 0.05,
};

export const SPIN_OPTIONS_ANTICIPATED_FAST = {
	...SPIN_OPTIONS_FAST,
	reelBounceBackSpeed: 0.3,
	reelSpinSpeed: 8,
	reelSpinSpeedBeforeBounce: 8,
	reelPaddingMultiplierAnticipated: 3,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 1, height: 1 },
};

const h1Static = { type: 'sprite', assetKey: 'h1.png', sizeRatios: { width: 1, height: 1 } };
const h2Static = { type: 'sprite', assetKey: 'h2.png', sizeRatios: { width: 1, height: 1 } };
const h3Static = { type: 'sprite', assetKey: 'h3.png', sizeRatios: { width: 1, height: 1 } };
const h4Static = { type: 'sprite', assetKey: 'h4.png', sizeRatios: { width: 1, height: 1 } };

const l1Static = { type: 'sprite', assetKey: 'l1.png', sizeRatios: { width: 1, height: 1 } };
const l2Static = { type: 'sprite', assetKey: 'l2.png', sizeRatios: { width: 1, height: 1 } };
const l3Static = { type: 'sprite', assetKey: 'l3.png', sizeRatios: { width: 1, height: 1 } };
const l4Static = { type: 'sprite', assetKey: 'l4.png', sizeRatios: { width: 1, height: 1 } };
const l5Static = { type: 'sprite', assetKey: 'l5.png', sizeRatios: { width: 1, height: 1 } };

const sStatic = { type: 'sprite', assetKey: 'S.png', sizeRatios: { width: 1.243, height: 1.243 } };
const wStatic = { type: 'sprite', assetKey: 'W.png', sizeRatios: { width: 1.12, height: 1.12 } };

export const SYMBOL_INFO_MAP = {
	H1: {
		explosion,
		win: h1Static,
		postWinStatic: h1Static,
		static: h1Static,
		spin: h1Static,
		land: h1Static,
	},
	H2: {
		explosion,
		win: h2Static,
		postWinStatic: h2Static,
		static: h2Static,
		spin: h2Static,
		land: h2Static,
	},
	H3: {
		explosion,
		win: h3Static,
		postWinStatic: h3Static,
		static: h3Static,
		spin: h3Static,
		land: h3Static,
	},
	H4: {
		explosion,
		win: h4Static,
		postWinStatic: h4Static,
		static: h4Static,
		spin: h4Static,
		land: h4Static,
	},
	L1: {
		explosion,
		win: l1Static,
		postWinStatic: l1Static,
		static: l1Static,
		spin: l1Static,
		land: l1Static,
	},
	L2: {
		explosion,
		win: l2Static,
		postWinStatic: l2Static,
		static: l2Static,
		spin: l2Static,
		land: l2Static,
	},
	L3: {
		explosion,
		win: l3Static,
		postWinStatic: l3Static,
		static: l3Static,
		spin: l3Static,
		land: l3Static,
	},
	L4: {
		explosion,
		win: l4Static,
		postWinStatic: l4Static,
		static: l4Static,
		spin: l4Static,
		land: l4Static,
	},
	L5: {
		explosion,
		win: l5Static,
		postWinStatic: l5Static,
		static: l5Static,
		spin: l5Static,
		land: l5Static,
	},
	W: {
		explosion,
		postWinStatic: wStatic,
		static: wStatic,
		spin: wStatic,
		win: wStatic,
		land: wStatic,
	},
	S: {
		explosion,
		postWinStatic: sStatic,
		static: sStatic,
		spin: sStatic,
		win: sStatic,
		land: sStatic,
	},
} as const;

export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
	5: 'sfx_scatter_stop_5',
} as const;

// Bottom controls use the 1672 × 941 coffee-background coordinate system.
// Edit x/y to move one item; edit scale to resize only that item.
export const COFFEE_CONTROL_LAYOUT = {
	menu: { x: 0, y: 17, scale: 1 },
	buyBonus: { x: 122, y: -8, scale: 1 },
	balance: { x: 302, y: 57, scale: 0.9 },
	bet: { x: 762, y: 57, scale: 1 },
	win: { x: 532, y: 57, scale: 1 },
	plus: { x: 992, y: 0, scale: 1 },
	minus: { x: 992, y: 42, scale: 1 },
	auto: { x: 1092, y: 17, scale: 1 },
	spin: { x: 1214, y: -10, scale: 1 },
	turbo: { x: 1404, y: 17, scale: 1 },
} as const;
