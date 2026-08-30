import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { m } from '$lib/paraglide/messages.js';
import type { Route } from '$lib/routes';
import type { TourGuideClient, TourGuideOptions, TourGuideStep } from '$lib/types/tourguide';

async function createTourGuideClient(options: TourGuideOptions): Promise<TourGuideClient> {
	const module = (await import('@sjmc11/tourguidejs')) as unknown as {
		TourGuideClient: new (options: TourGuideOptions) => TourGuideClient;
	};
	return new module.TourGuideClient(options);
}

// `client.exit()` solo oculta el diálogo/backdrop (display: none), nunca los
// quita del DOM. Como el trigger en `/` ahora es un $effect (se re-ejecuta al
// loguearse, no solo al montar), un mismo mount puede pasar de tour invitado a
// tour miembro sin recarga: sin esto, el diálogo huérfano del tour anterior
// duplicaría los id="tg-dialog-title"/"tg-dialog-body" del nuevo cliente.
function removeStaleTourDom() {
	if (typeof document === 'undefined') return;
	document.querySelectorAll('.tg-dialog, .tg-backdrop').forEach((el) => el.remove());
}

const GUEST_STORAGE_KEY = 'onboarding-tour-guest-v1';
const MEMBER_STORAGE_KEY = 'onboarding-tour-member-v1';

// El enlace a estas rutas está duplicado (nav de escritorio / Dock de móvil),
// y solo uno de los dos elementos es visible según el ancho de pantalla (ver
// `firstVisible`). Los ids se centralizan aquí para que los componentes que
// los asignan (DockLink, NavBarList) y los pasos del tour que los buscan
// (más abajo) no puedan desincronizarse.
const TOUR_ADD_GANG_DESKTOP_ID = 'tour-add-gang-desktop';
const TOUR_ADD_GANG_MOBILE_ID = 'tour-add-gang-mobile';
const TOUR_ACTIVITIES_DESKTOP_ID = 'tour-activities-desktop';
const TOUR_ACTIVITIES_MOBILE_ID = 'tour-activities-mobile';

export const tourDesktopElementIds: Partial<Record<Route['id'], string>> = {
	'/gang/add': TOUR_ADD_GANG_DESKTOP_ID,
	'/activities': TOUR_ACTIVITIES_DESKTOP_ID
};

export const tourMobileElementIds: Partial<Record<Route['id'], string>> = {
	'/gang/add': TOUR_ADD_GANG_MOBILE_ID,
	'/activities': TOUR_ACTIVITIES_MOBILE_ID
};

type TourState = {
	activeStep: number;
	finished: boolean;
};

export type AppTourStep = TourGuideStep & {
	route?: string;
	stepIndex?: number;
};

type MinimalGang = {
	id: string | number;
	status: string;
	name: string;
};

// Nombre de la peña usada como ejemplo en el tour cuando está validada; si no
// existe (u otro entorno no la tiene creada), se cae a la primera validada.
const EXAMPLE_GANG_NAME = 'kpy';

function findExampleGang(gangs: MinimalGang[]): MinimalGang | undefined {
	const validatedGangs = gangs.filter((g) => g.status === 'VALIDATED');
	return (
		validatedGangs.find((g) => g.name.toLowerCase() === EXAMPLE_GANG_NAME) ?? validatedGangs[0]
	);
}

function getState(storageKey: string): TourState | null {
	if (typeof localStorage === 'undefined') return null;
	const raw = localStorage.getItem(storageKey);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as TourState;
	} catch {
		return null;
	}
}

function setState(storageKey: string, state: TourState) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(storageKey, JSON.stringify(state));
}

function finishTour(storageKey: string, stepsLength: number) {
	setState(storageKey, { activeStep: stepsLength - 1, finished: true });
}

function stepRouteMatches(stepRoute: string | undefined, currentPath: string): boolean {
	if (!stepRoute) return true;
	if (stepRoute === currentPath) return true;
	if (stepRoute.includes('[slug]')) {
		const regex = new RegExp('^' + stepRoute.replace('[slug]', '[^/]+') + '$');
		return regex.test(currentPath);
	}
	return false;
}

// Tour para visitantes sin sesión: solo lo que se puede hacer sin loguearse.
// Se ofrece a cualquiera que entre por primera vez a la home.
const guestTourSteps: AppTourStep[] = [
	{
		title: m.tour_filter_title(),
		content: m.tour_filter_description(),
		target: '#tour-filter',
		route: '/'
	},
	{
		title: m.tour_activities_title(),
		content: m.tour_activities_description(),
		target: `#${TOUR_ACTIVITIES_DESKTOP_ID}`,
		route: '/'
	},
	{
		title: m.tour_login_cta_title(),
		content: m.tour_login_cta_description(),
		target: '#tour-login',
		route: '/'
	}
];

// Tour para usuarios logueados: todo lo que requiere sesión. Arranca solo la
// primera vez que, ya logueado, el usuario visita la home (ver runTour).
const memberTourSteps: AppTourStep[] = [
	{
		title: m.tour_add_gang_title(),
		content: m.tour_add_gang_description(),
		target: `#${TOUR_ADD_GANG_DESKTOP_ID}`,
		route: '/'
	},
	{
		title: m.tour_join_gang_title(),
		content: m.tour_join_gang_description(),
		target: '#tour-join-gang',
		route: '/gang/[slug]'
	},
	{
		title: m.tour_gang_image_title(),
		content: m.tour_gang_image_description(),
		target: '#tour-gang-image',
		route: '/gang/[slug]'
	},
	{
		title: m.tour_profile_image_title(),
		content: m.tour_profile_image_description(),
		target: '#tour-profile-image',
		route: '/profile'
	},
	{
		title: m.tour_notifications_title(),
		content: m.tour_notifications_description(),
		target: '#tour-notifications',
		route: '/profile'
	}
];

// Un elemento oculto por CSS (p.ej. `hidden lg:flex`) sigue en el DOM, así que
// document.querySelector(selector) puede devolverlo aunque no sea el visible
// para el viewport actual. Se elige el primero cuyo offsetParent exista.
function firstVisible(...selectors: string[]): HTMLElement | undefined {
	for (const selector of selectors) {
		const element = document.querySelector<HTMLElement>(selector);
		if (element && element.offsetParent !== null) return element;
	}
	return undefined;
}

function buildGuestTourSteps(): AppTourStep[] {
	return guestTourSteps.map((step, index) => {
		const clone: AppTourStep = { ...step, stepIndex: index };

		// Paso "actividades": preparado para un futuro enlace en el Dock móvil,
		// aunque hoy solo exista la versión de escritorio.
		if (index === 1) {
			clone.target =
				firstVisible(`#${TOUR_ACTIVITIES_DESKTOP_ID}`, `#${TOUR_ACTIVITIES_MOBILE_ID}`) ??
				document.body;
		}

		return clone;
	});
}

function buildMemberTourSteps(gangs: MinimalGang[]): AppTourStep[] {
	const validatedGang = findExampleGang(gangs);

	return memberTourSteps.map((step, index) => {
		const clone: AppTourStep = { ...step, stepIndex: index };

		// Paso "añadir peña": el enlace está duplicado (nav de escritorio / Dock
		// de móvil) y solo uno es visible según el ancho de pantalla.
		if (index === 0) {
			clone.target =
				firstVisible(`#${TOUR_ADD_GANG_DESKTOP_ID}`, `#${TOUR_ADD_GANG_MOBILE_ID}`) ??
				document.body;
		}

		// Paso de unirse a una peña: si no hay peñas validadas, se muestra centrado
		// explicando la acción sin intentar navegar a una peña inexistente.
		if (index === 1 && !validatedGang) {
			clone.target = document.body;
			clone.content = m.tour_join_gang_no_gangs_description();
		}

		return clone;
	});
}

let navigatingBetweenPages = false;

// TourGuideJS marca `_promiseWaiting = true` antes de invocar onBeforeStepChange
// y solo lo limpia si el callback resuelve sin abortar el cambio de paso. Como
// aquí abortamos el paso interno (navegamos nosotros con goto), `client.exit()`
// llamado desde dentro de ese callback rechaza inmediatamente ("Promise
// waiting") y dejaría el diálogo bloqueado en loading para siempre. Se
// resetea el flag interno antes de salir para evitarlo.
function unblockClient(client: TourGuideClient) {
	(client as unknown as { _promiseWaiting: boolean })._promiseWaiting = false;
}

async function navigateToStep(
	client: TourGuideClient,
	storageKey: string,
	nextIndex: number,
	route: string,
	validatedGang?: MinimalGang
) {
	navigatingBetweenPages = true;
	setState(storageKey, { activeStep: nextIndex, finished: false });
	unblockClient(client);
	await client.exit();
	// `client.exit()` solo oculta el diálogo y el backdrop (display: none), no
	// los elimina del DOM. Como cada página crea su propio TourGuideClient,
	// dejarlos huérfanos duplica los id="tg-dialog-title"/"tg-dialog-body" del
	// siguiente cliente: getElementById() encuentra el nodo viejo (oculto) en
	// vez del nuevo, y el diálogo de la página destino se queda sin contenido.
	client.dialog?.remove();
	client.backdrop?.remove();
	navigatingBetweenPages = false;

	switch (route) {
		case '/':
			await goto(resolve('/'));
			break;
		case '/gang/[slug]':
			await goto(resolve('/gang/[slug]', { slug: String(validatedGang?.id) }));
			break;
		case '/profile':
			await goto(resolve('/profile'));
			break;
	}
}

async function handleBeforeStepChange(
	client: TourGuideClient,
	storageKey: string,
	steps: AppTourStep[],
	currentPath: string,
	gangs: MinimalGang[],
	currentStepIndex: number,
	nextStepIndex: number
) {
	// Solo interceptamos avances hacia delante; los pasos hacia atrás ya están
	// en una página que los contiene.
	if (nextStepIndex <= currentStepIndex) return;

	const nextBaseStep = steps[nextStepIndex];
	if (!nextBaseStep) return;
	if (stepRouteMatches(nextBaseStep.route, currentPath)) return;

	if (!nextBaseStep.route) return;

	const validatedGang = findExampleGang(gangs);
	if (nextBaseStep.route.includes('[slug]') && !validatedGang) {
		finishTour(storageKey, steps.length);
		unblockClient(client);
		await client.exit();
		throw new Error('Tour navigation aborted');
	}

	await navigateToStep(client, storageKey, nextStepIndex, nextBaseStep.route, validatedGang);
	throw new Error('Tour navigation triggered');
}

export function startOnboardingTour(isLoggedIn: boolean) {
	setState(isLoggedIn ? MEMBER_STORAGE_KEY : GUEST_STORAGE_KEY, {
		activeStep: 0,
		finished: false
	});
	if (typeof window !== 'undefined') {
		window.location.href = resolve('/');
	}
}

async function runTour(
	storageKey: string,
	steps: AppTourStep[],
	currentPath: string,
	gangs: MinimalGang[]
) {
	const state = getState(storageKey);
	if (state?.finished) return;

	const activeStep = state?.activeStep ?? 0;

	// Si nunca se ha visto este tour, solo se inicia desde la home.
	if (!state && currentPath !== '/') return;

	const currentStep = steps[activeStep];
	if (!currentStep) return;

	if (!stepRouteMatches(currentStep.route, currentPath)) return;

	const client = await createTourGuideClient({
		activeStep,
		rememberStep: false,
		nextLabel: m.tour_next_button(),
		prevLabel: m.tour_prev_button(),
		finishLabel: m.tour_finish_button(),
		closeButton: true,
		showStepProgress: true,
		showStepDots: true,
		keyboardControls: true,
		exitOnEscape: true,
		exitOnClickOutside: false,
		completeOnFinish: false,
		autoScroll: true,
		autoScrollSmooth: true,
		activeStepInteraction: true
	});

	// La opción `activeStep` del constructor no la usa la librería: `start()`
	// llama a `visitStep(this.activeStep)`, y ese campo de instancia solo se
	// fija internamente (por defecto 0). Sin esto, cada página siempre
	// arrancaría el tour en el paso 0 en vez de retomar el guardado.
	client.activeStep = activeStep;

	await client.setOptions({ steps });

	client.onBeforeStepChange(async (currentStepIndex, nextStepIndex) => {
		await handleBeforeStepChange(
			client,
			storageKey,
			steps,
			currentPath,
			gangs,
			currentStepIndex,
			nextStepIndex
		);
		setState(storageKey, { activeStep: nextStepIndex, finished: false });
	});

	client.onBeforeExit(() => {
		if (navigatingBetweenPages) return;
		finishTour(storageKey, steps.length);
	});

	client.onFinish(() => {
		finishTour(storageKey, steps.length);
	});

	await client.start();
}

// El `$effect` que llama a esta función en `/` se re-ejecuta con cualquier
// cambio de `data` (p.ej. el `invalidateAll()` de un login por modal), y no
// espera a que la llamada anterior termine. Sin este cerrojo, dos llamadas
// solapadas crearían dos `TourGuideClient`: el `removeStaleTourDom()` de la
// segunda se llevaría por delante el diálogo que la primera acaba de montar.
let tourInProgress = false;

export async function continueOnboardingTour(
	currentPath: string,
	user: App.Locals['user'] | null,
	gangs: MinimalGang[] = []
) {
	if (typeof window === 'undefined') return;
	if (tourInProgress) return;

	tourInProgress = true;
	try {
		removeStaleTourDom();

		if (user) {
			await runTour(MEMBER_STORAGE_KEY, buildMemberTourSteps(gangs), currentPath, gangs);
		} else {
			await runTour(GUEST_STORAGE_KEY, buildGuestTourSteps(), currentPath, []);
		}
	} finally {
		tourInProgress = false;
	}
}
