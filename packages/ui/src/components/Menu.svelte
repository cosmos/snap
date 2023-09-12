<script>
	import { goto } from '$app/navigation';
  import { page } from '$app/stores';

    let menu_items = [
        { route: "/balances", title: "Balances", icon: "M11.6 16.733c.234.268.548.456.895.534a1.4 1.4 0 0 0 1.75-.762c.172-.615-.445-1.287-1.242-1.481-.796-.194-1.41-.862-1.241-1.481a1.4 1.4 0 0 1 1.75-.763c.343.078.654.261.888.525m-1.358 4.017v.617m0-5.94v.726M1 10l5-4 4 1 7-6m0 0h-3.207M17 1v3.207M5 19v-6m-4 6v-4m17 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z", path: "/balances" },
        { route: "/transactions", title: "History", icon: "M1 1h14M1 6h14M1 11h7", path: "/transactions" },
        { route: "/address", title: "Address Book", icon: "M1 17V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M5 15V1m8 18v-4", path: "/address" },
        { route: "/swap", title: "Swap", icon: "M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97", path: "/swap" },
        { route: "/fiat", title: "Fiat", icon: "M4 9h2m3 0h5M1 5h18M2 1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z", path: "/fiat" },
        { route: "/settings", title: "Settings", icon: "M19 11V9a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L12 2.757V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L2.929 4.343a1 1 0 0 0 0 1.414l.536.536L2.757 8H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535L8 17.243V18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H18a1 1 0 0 0 1-1Z", path: "/settings" }
    ]
    let active = $page.route.id;

    $: {
      active = $page.route.id;
    };
</script>

<div class="menu-div">
    <div class="frame-47 frame-2">
        {#each menu_items as tab}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div on:click={() => goto(tab.path)} class="w-full flex justify-between h-[40px] items-center cursor-pointer">
            <div class="frame">
                <svg class="item w-6 h-6 text-white flex items-center justify-center" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={tab.icon}/>
                </svg>
                <div class="item-1 inter-medium-white-16px">{tab.title}</div>
            </div>
            <div hidden={active != tab.route} class="rectangle-12"></div>
          </div>
        {/each}
    </div>
</div>

<style>
.rectangle-12 {
  background-color: var(--blueberry);
  height: 29px;
  width: 5px;
}

.frame-47 {
  align-items: flex-start;
  flex-direction: column;
  margin-top: 40px;
}

.frame-2 {
  display: flex;
  justify-content: center;
  width: auto;
  padding: 20px;
  gap: 10px;
}

.frame {
  align-items: center;
  display: flex;
  gap: 10px;
  width: fit-content;
}

.item {
  height: 18px;
  min-width: 18px;
  position: relative;
}

.item-1 {
  letter-spacing: -0.48px;
  line-height: 16px;
  position: relative;
  white-space: nowrap;
  width: fit-content;
}

.inter-medium-white-16px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-l);
  font-style: normal;
  font-weight: 500;
}

@media (min-width: 768px) {
}

@media (max-width: 768px) {
  .menu-div {
    display: none;
  }
}
</style>