import { stateI18nDerived } from 'state-shared';

import { i18nDerived as i18nDerivedUiPixi } from 'components-ui-pixi';
import { i18nDerived as i18nDerivedUiHtml } from 'components-ui-html';

export const i18nDerived = {
	...i18nDerivedUiPixi,
	...i18nDerivedUiHtml,
	home: () => stateI18nDerived.translate('HOME'),
	gameRules: () => stateI18nDerived.translate('GAME RULES'),
	close: () => stateI18nDerived.translate('CLOSE'),
	spin: () => stateI18nDerived.translate('SPIN'),
	notTranslated: () => stateI18nDerived.translate('NOT TRANSLATED'),
};
