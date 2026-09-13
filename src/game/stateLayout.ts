import { createLayout } from 'utils-layout';
import { DESKTOP_BACKGROUND_RATIO } from './constants';

export const { stateLayout, stateLayoutDerived } = createLayout({
	backgroundRatio: {
		normal: DESKTOP_BACKGROUND_RATIO,
		// Always use the coffee artwork's landscape canvas. Narrow screens contain it
		// and scale the complete composition instead of switching to a mobile scene.
		portrait: DESKTOP_BACKGROUND_RATIO,
	},
	mainSizesMap: {
		desktop: { width: 1672, height: 941 },
		tablet: { width: 1672, height: 941 },
		landscape: { width: 1672, height: 941 },
		portrait: { width: 1672, height: 941 },
	},
});
