import type { PageServerLoad } from './$types';

// El user-agent se lee en el servidor para que las instrucciones correctas
// se rendericen ya en el primer HTML, sin esperar a la hidratación.
export const load: PageServerLoad = ({ request }) => {
	return { userAgent: request.headers.get('user-agent') ?? '' };
};
