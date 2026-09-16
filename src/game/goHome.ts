// Home behaviour: prefer an explicit lobby URL from the casino, then browser
// history; window.close() covers games opened in a dedicated tab/window.
export const goHome = () => {
	const lobbyUrl = new URLSearchParams(window.location.search).get('lobby_url');
	if (lobbyUrl) {
		window.location.href = lobbyUrl;
		return;
	}
	if (window.history.length > 1) {
		window.history.back();
		return;
	}
	window.close();
};
