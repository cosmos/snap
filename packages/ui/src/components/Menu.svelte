<script>
	import { goto } from '$app/navigation';
  import { page } from '$app/stores';

    let menu_items = [
        { route: "/balances", title: "Balances", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/dashboard.svg", path: "/balances" },
        { route: "/transactions", title: "History", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/dns.svg", path: "/transactions" },
        { route: "/address", title: "Address Book", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/account-box.svg", path: "/address" },
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
                <img
                class="item"
                src={tab.icon}
                alt={tab.title.toLowerCase()}
                />
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
  height: 20px;
  min-width: 20px;
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