<script lang="ts">
  import type { Routes, Route } from "@repo/library";

  import Link from "./Link.svelte";

  export type Props = {
    type: "horizontal" | "drawer";
    routes: Routes;
  };

  let { type, routes }: Props = $props();

  function getClass() {
    if (type === "horizontal") {
      return "menu menu-horizontal";
    } else if (type === "drawer") {
      return "menu bg-base-200 min-h-full w-80 p-4";
    }
  }

  const routesArray: Route[] = Object.values(routes).filter(
    (route: Route) => route.showInMenu === true,
  );
</script>

<ul class={getClass()}>
  {#each routesArray as route (route.url)}
    <li><Link {route} /></li>
  {/each}
</ul>
