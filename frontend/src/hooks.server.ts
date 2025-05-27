import type { HandleFetch } from '@sveltejs/kit';
import { PUBLIC_API } from '$env/static/public';

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	if (request.url.startsWith(PUBLIC_API)) {
		request.headers.set('cookie', event.request.headers.get('cookie') || "");
	}

	return fetch(request);
};