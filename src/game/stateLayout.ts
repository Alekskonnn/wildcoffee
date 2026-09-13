import { createLayout } from 'utils-layout';
import { DESKTOP_BACKGROUND_RATIO, PORTRAIT_BACKGROUND_RATIO } from './constants';

export const { stateLayout, stateLayoutDerived } = createLayout({
	// The mobile route is selected below 768px wide. Keep its portrait artboard
	// even when the browser becomes short or nearly square.
	forcePortraitWhenNarrow: true,
	backgroundRatio: {
		normal: DESKTOP_BACKGROUND_RATIO,
		// Mobile uses the portrait Wild Coffee artwork, so every Pixi overlay uses
		// the identical coordinate system as the CSS background and HTML controls.
		portrait: PORTRAIT_BACKGROUND_RATIO,
	},
	mainSizesMap: {
		desktop: { width: 1672, height: 941 },
		tablet: { width: 1672, height: 941 },
		landscape: { width: 1672, height: 941 },
		portrait: { width: 941, height: 1672 },
	},
});
