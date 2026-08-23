import { json, type RequestEvent } from '@sveltejs/kit';
import { requireSameOrigin } from './csrf';
import { memberRequestSchema } from './membership';
import { m } from '$lib/paraglide/messages.js';

type ParsedMemberRequest =
	| {
			ok: true;
			userId: string;
			gangId: number;
			confirmed: boolean;
			userLogged: NonNullable<RequestEvent['locals']['user']>;
	  }
	| { ok: false; response: Response };

// Boilerplate común a addMember/validateMember/refuseMember (Q12): comprobar
// el Origin, parsear el cuerpo JSON, validar userId/gangId y exigir sesión.
// La autorización y la lógica de negocio de cada endpoint siguen siendo
// distintas a propósito; unificarlas también habría sido forzar tres flujos
// distintos en una sola función genérica.
export async function parseMemberRequest(event: RequestEvent): Promise<ParsedMemberRequest> {
	requireSameOrigin(event.request, event.url);

	const body = await event.request.json().catch(() => null);
	const parsed = memberRequestSchema.safeParse({
		userId: body?.userId,
		gangId: body?.gangId,
		confirmed: body?.confirmed
	});

	if (!parsed.success) {
		return {
			ok: false,
			response: json({ success: false, message: m.error_missing_parameters() }, { status: 400 })
		};
	}

	const userLogged = event.locals.user;
	if (!userLogged) {
		return {
			ok: false,
			response: json({ success: false, message: m.error_user_not_logged_in() }, { status: 401 })
		};
	}

	return {
		ok: true,
		userId: parsed.data.userId,
		gangId: parsed.data.gangId,
		confirmed: parsed.data.confirmed === true,
		userLogged
	};
}
