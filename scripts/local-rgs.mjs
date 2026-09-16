/**
 * Local RGS emulator for development.
 *
 * Serves the real math-sdk output (books + lookup tables from library/publish_files)
 * through the Stake Engine wallet API, so the frontend runs in the production code
 * path (Authenticate -> xstate -> /wallet/play) instead of the bundled mock books.
 *
 * Usage:
 *   node scripts/local-rgs.mjs            # port 4000
 *   PORT=5000 node scripts/local-rgs.mjs
 *
 * Then open the game with:
 *   http://localhost:3010/?sessionID=local-dev&rgs_url=localhost:4000&lang=en&device=desktop
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 4000);
const START_BALANCE = Number(process.env.BALANCE || 10_000) * 1e6;
const PUBLISH_DIR = process.env.PUBLISH_DIR
	? resolve(process.env.PUBLISH_DIR)
	: resolve(__dirname, '../../../../math-sdk/games/0_0_wildcoffee/library/publish_files');

// ---------- load math output ----------

const readJsonlZst = (file) => {
	const out = spawnSync('zstd', ['-dc', file], { maxBuffer: 1 << 30 });
	if (out.status !== 0) {
		throw new Error(`zstd failed for ${file}: ${out.stderr?.toString() || out.error}`);
	}
	return out.stdout
		.toString()
		.split('\n')
		.filter(Boolean)
		.map((line) => JSON.parse(line));
};

const loadModes = () => {
	const index = JSON.parse(readFileSync(join(PUBLISH_DIR, 'index.json'), 'utf8'));
	const modes = {};
	for (const mode of index.modes) {
		const books = new Map(readJsonlZst(join(PUBLISH_DIR, mode.events)).map((b) => [b.id, b]));
		// lookUpTable rows: id,weight,payout(*100)
		const rows = readFileSync(join(PUBLISH_DIR, mode.weights), 'utf8')
			.split('\n')
			.filter(Boolean)
			.map((line) => {
				const [id, weight] = line.split(',');
				return { id: Number(id), weight: Number(weight) };
			})
			.filter((row) => row.weight > 0 && books.has(row.id));
		const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
		modes[mode.name.toLowerCase()] = { cost: mode.cost, books, rows, totalWeight };
		console.log(
			`[rgs] mode "${mode.name}": ${books.size} books, cost x${mode.cost}, total weight ${totalWeight}`,
		);
	}
	return modes;
};

const modes = loadModes();

const pickBook = (mode) => {
	let roll = Math.random() * mode.totalWeight;
	for (const row of mode.rows) {
		roll -= row.weight;
		if (roll <= 0) return mode.books.get(row.id);
	}
	return mode.books.get(mode.rows[mode.rows.length - 1].id);
};

// ---------- sessions ----------

/** sessionID -> { balance, round: { payout, detail } | null, roundID } */
const sessions = new Map();

const getSession = (sessionID) => {
	if (!sessions.has(sessionID)) {
		sessions.set(sessionID, { balance: START_BALANCE, round: null, roundID: 0 });
	}
	return sessions.get(sessionID);
};

const settleRound = (session) => {
	if (session.round) {
		session.balance += session.round.payout;
		session.round = null;
	}
};

const balanceObject = (session) => ({
	amount: session.balance,
	currency: 'USD',
});

const SUCCESS = { statusCode: 'SUCCESS', statusMessage: '' };

const BET_LEVELS = [
	0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 7.5, 10, 15, 20, 30, 40, 50, 75, 100,
].map((level) => level * 1e6);

// ---------- API handlers ----------

const handlers = {
	'/wallet/authenticate': (body) => {
		const session = getSession(body.sessionID);
		return {
			status: SUCCESS,
			balance: balanceObject(session),
			config: {
				minBet: BET_LEVELS[0],
				maxBet: BET_LEVELS[BET_LEVELS.length - 1],
				stepBet: 100000,
				defaultBetLevel: 1e6,
				betLevels: BET_LEVELS,
				betModes: Object.fromEntries(
					Object.entries(modes).map(([name, mode]) => [
						name.toUpperCase(),
						{ mode: name.toUpperCase(), costMultiplier: mode.cost, feature: mode.cost > 1 },
					]),
				),
				jurisdiction: {
					socialCasino: false,
					disabledFullscreen: false,
					disabledTurbo: false,
					disabledSuperTurbo: false,
					disabledAutoplay: false,
					disabledSlamstop: false,
					disabledSpacebar: false,
					disabledBuyFeature: false,
					displayNetPosition: false,
					displayRTP: false,
					displaySessionTimer: false,
					minimumRoundDuration: 0,
				},
			},
			round: null,
		};
	},

	'/wallet/balance': (body) => {
		const session = getSession(body.sessionID);
		return { status: SUCCESS, balance: balanceObject(session) };
	},

	'/wallet/play': (body) => {
		const session = getSession(body.sessionID);
		const mode = modes[String(body.mode || 'base').toLowerCase()];
		if (!mode) {
			return { status: { statusCode: 'ERR_UE', statusMessage: `Unknown mode ${body.mode}` }, error: `Unknown mode ${body.mode}` };
		}

		settleRound(session); // auto-settle a previous round the client never closed

		const cost = Math.round(body.amount * mode.cost);
		if (cost <= 0 || cost > session.balance) {
			return { status: { statusCode: 'ERR_IPB', statusMessage: 'Insufficient balance' }, error: 'Insufficient balance' };
		}
		session.balance -= cost;

		const book = pickBook(mode);
		const payoutMultiplier = book.payoutMultiplier / 100;
		const payout = Math.round(body.amount * payoutMultiplier);
		session.roundID += 1;

		const round = {
			roundID: session.roundID,
			amount: body.amount,
			payout,
			payoutMultiplier,
			active: payout > 0,
			mode: body.mode,
			event: null,
			state: book.events,
		};
		if (payout > 0) session.round = { payout };

		console.log(
			`[rgs] play session=${body.sessionID} mode=${body.mode} book=${book.id} bet=${cost / 1e6} win=${payout / 1e6}`,
		);
		return { status: SUCCESS, balance: balanceObject(session), round };
	},

	'/wallet/end-round': (body) => {
		const session = getSession(body.sessionID);
		settleRound(session);
		return { status: SUCCESS, balance: balanceObject(session) };
	},

	'/bet/event': (body) => {
		return { status: SUCCESS, event: body.event };
	},
};

// ---------- HTTP server ----------

const server = http.createServer((req, res) => {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
		'Access-Control-Allow-Headers': 'content-type',
	};
	if (req.method === 'OPTIONS') {
		res.writeHead(204, headers);
		res.end();
		return;
	}

	const pathName = new URL(req.url, `http://${req.headers.host}`).pathname;
	const handler = handlers[pathName];
	if (!handler || req.method !== 'POST') {
		res.writeHead(404, { ...headers, 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: `No handler for ${req.method} ${pathName}` }));
		return;
	}

	let raw = '';
	req.on('data', (chunk) => (raw += chunk));
	req.on('end', () => {
		try {
			const body = raw ? JSON.parse(raw) : {};
			const data = handler(body);
			res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
			res.end(JSON.stringify(data));
		} catch (error) {
			console.error('[rgs] error:', error);
			res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: String(error) }));
		}
	});
});

server.listen(PORT, () => {
	console.log(`[rgs] local RGS listening on http://localhost:${PORT}`);
	console.log(`[rgs] game URL: http://localhost:3010/?sessionID=local-dev&rgs_url=localhost:${PORT}&lang=en&device=desktop`);
});
