import { API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const users = [];

	let cursor = null;
	do {
		const data = await fetchUsers(params.id, cursor);
		cursor = data.next?.cursor;
		users.push(...data.users);
	} while (cursor);

	return json(users);
}

async function fetchUsers(channel: string, cursor: string) {
	const response = await fetch(
		`https://api.neynar.com/v2/farcaster/channel/followers?limit=1000&id=${channel}${cursor ? `&cursor=${cursor}` : ''}`,
		{
			method: 'GET',
			headers: { accept: 'application/json', api_key: API_KEY }
		}
	);

	return await response.json();
}
