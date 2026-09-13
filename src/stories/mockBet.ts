import { randomInteger } from 'utils-shared/random';

import { playBet } from '../game/utils';
import baseBooks from './data/base_books';
import bonusBooks from './data/bonus_books';

const playRandomBook = async (books: typeof baseBooks) => {
	const index = randomInteger({ min: 0, max: books.length - 1 });
	const data = books[index];
	console.log('Running a mock bet at index', index);
	await playBet({ ...data, state: data.events });
};

export const playRandomBaseBook = async () => playRandomBook(baseBooks);
export const playRandomBonusBook = async () => playRandomBook(bonusBooks);
