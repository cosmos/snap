<script>
	import { goto } from '$app/navigation';
  import { page } from '$app/stores';

    let menu_items = [
        { route: "/balances", title: "Balances", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/dashboard.svg", path: "/balances" },
        { route: "/transactions", title: "History", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/dns.svg", path: "/transactions" },
        { route: "/address", title: "Address Book", icon: "M1 17V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M5 15V1m8 18v-4", path: "/address" },
        { route: "/swap", title: "Swap", icon: "M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97", path: "/swap" },
        { route: "/fiat", title: "Fiat", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/account-box.svg", path: "/fiat" },
        { route: "/settings", title: "Settings", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/settings.svg", path: "/settings" }
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
                <svg class="item w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
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