import { getRequestEvent } from '$app/server';
import type { EventLocals } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ }) => {
	const data: EventLocals = getRequestEvent().locals as any;
	return data;
};