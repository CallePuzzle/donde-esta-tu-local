import type { PageServerLoad, PageServerLoadEvent } from "./$types";

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
  console.log(event.locals);

  return {};
};
