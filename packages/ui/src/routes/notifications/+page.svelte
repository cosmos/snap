<script lang="ts">
	import { notifications, forceUpdateNotifications } from "../../store/notifications";
  import { chains } from "../../store/chains";

  const getImgURI = (chain_id: string) => {
    const akash = $chains.find((chain) => chain.chain_id === chain_id);
    if (!akash) return "";
    return akash.logo_URIs?.png || "";
  };

  const markAsRead = async (lease_id: string) => {
    // force update notifications store since its updated
    forceUpdateNotifications();
  };
</script>

<div class="w-full flex flex-col justify-center items-center h-full bg-[transparent]">
  <div class="rectangle-13">
    <div class="w-full flex justify-between mb-[20px]">
      <div class="chain-management">Notifications</div>
    </div>
    <div id="items-div" class="w-full overflow-scroll">
      {#each $notifications as notification}
        <div class="group-4407">
          <div class="group-45">
            <div class="group-45-1">
              <img
                class="mask-group"
                src={getImgURI(notification.chain_id)}
                alt="Mask group"
              />
              <div class="group-4405">
                <div class="group-4400">
                  <div class="group-4537">
                      {#if notification.read}
                        <div class="opacity-40 text-white font-inter leading-5">
                          {notification.notification}
                        </div>
                      {:else}
                        <div class="text-white font-inter leading-5">
                          {notification.notification}
                        </div>
                      {/if}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <div class="cursor-pointer" on:click={() => markAsRead(notification.lease)}>
                        {#if notification.read}
                          <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11v5m0 0 2-2m-2 2-2-2M3 6v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Zm2 2v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8H5Z"/>
                          </svg>
                        {:else}
                          <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M20 10H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM9 13v-1h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z" clip-rule="evenodd"/>
                            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2Z"/>
                          </svg>                        
                        {/if}        
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
* {
  box-sizing: border-box;
}

#items-div::-webkit-scrollbar {
  display: none;
}

.group-4407 {
  display: grid;
  width: 100%;
  margin-top: 20px;
  justify-items: center;
}

.group-45 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  align-items: flex-end;
  backdrop-filter: blur(15px) brightness(100%);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  width: 100%;
  padding: 20px;
}

.group-45-1 {
  display: flex;
  gap: 15px;
  width: 100%;
  align-items: center;
}

.mask-group {
  height: 38px;
  margin-top: 1px;
  width: 38px;
}

.group-4405 {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.group-4400 {
  display: flex;
  width: 100%;
}

.group-4537 {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
}

.rectangle-13 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  max-height: 480px;
}

.chain-management {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
  text-align: center;
  align-self: center;
}
</style>