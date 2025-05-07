import { getRequestEvent } from '$app/server';
import type { EventLocals } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	const data: EventLocals = getRequestEvent().locals as any;
	console.log("EL:", data);
	return data;
};