<script>
	import { goto } from "$app/navigation";
  import { page } from '$app/stores';

    let menu_items = [
        { route: "/dashboard", title: "Dashboard", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/dashboard.svg", path: "/dashboard" },
        { route: "/transactions", title: "History", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/dns.svg", path: "/transactions" },
        { route: "/address", title: "Address Book", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/account-box.svg", path: "/address" },
        { route: "/settings", title: "Settings", icon: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/settings.svg", path: "/settings" }
    ]
    export let active = $page.route.id
</script>

<div class="">
    <div class="frame-47 frame-2">
        {#each menu_items as tab}
          <div class="w-full flex justify-between h-[20px]">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="frame" on:click={() => goto(tab.path)}>
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
  left: 233px;
  top: 123px;
  width: 5px;
}

.frame-47 {
  align-items: flex-start;
  flex-direction: column;
  gap: 40px;
  margin-top: 40px;
}

.frame-2 {
  display: flex;
  justify-content: center;
  width: auto;
  padding: 20px;
}

.frame {
  align-items: center;
  display: flex;
  gap: 10px;
  width: fit-content;
  cursor: pointer;
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
</style>