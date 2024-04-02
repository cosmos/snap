<script lang="ts">
  import type { Pubkey } from "@cosmjs/amino";
	import { copyToClipboard } from "../utils/general";
  import _ from "lodash";

  export let name: string;
  export let threshold = 0;
  export let memberCount = 0;
  export let publicKey: string;
  let copied = false;
  let pk: Pubkey;

  $: {
    pk = JSON.parse(publicKey);
  }

  const copyAddress = async () => {
    await copyToClipboard(pk.value);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1000)
  }
</script>

<div class="group-55">
  <div class="group-51">
      <div class="group-28">
          <div class="group-46 rounded-[100px] text-white flex items-center justify-center">
            {name[0].toUpperCase()}
          </div>
      </div>
      <div class="group-49">
          <div class="chain inter-bold-white-22px">
              {name}
          </div>
      <div class="group-53">
          <p class="price inter-medium-white-12px">
            {threshold}/{memberCount} Threshold
          </p>
      </div>
  </div>
  <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
  </svg>  
</div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={copyAddress} class="frame-33 frame-2">
  <div class="cosmos1vhw82tqftrg-1 inter-medium-white-14px">
      {pk.value}
  </div>
    {#if copied}
      <svg class="text-white w-5 h-5 text-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 1v4a1 1 0 0 1-1 1H1m4 6 2 2 4-4m4-8v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
      </svg>
    {:else}
      <svg class="text-white w-5 h-5 text-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 5a1 1 0 0 0-1 1v12a.969.969 0 0 0 .933 1h8.1a1 1 0 0 0 1-1.033M10 1v4a1 1 0 0 1-1 1H5m10-4v12a.97.97 0 0 1-.933 1H5.933A.97.97 0 0 1 5 14V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 9.828 1h4.239A.97.97 0 0 1 15 2Z"/>
      </svg>
    {/if}
  </div>
</div>

<style>
.group-55 {
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 17px;
  left: 264px;
  min-height: 110px;
  padding: 20px 17px;
  top: 405px;
  width: 100%;
}

.group-51 {
  align-items: center;
  display: flex;
  gap: 15px;
  width: 100%;
}

.group-28 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 24px;
  display: flex;
  height: 48px;
  min-width: 48px;
  padding: 2.1px 2.1px;
  align-items: center;
  justify-content: center;
}

.group-46 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--eerie-black);
  background-size: 100% 100%;
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 19.9px;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  justify-items: center;
}

.chain {
  letter-spacing: -0.6px;
  line-height: normal;
  min-height: 24px;
  white-space: nowrap;
}

.inter-bold-white-22px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
  width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-53 {
  display: flex;
  height: 17px;
  width: 100%;
  margin-top: 5px;
  justify-content: space-between;
}

.price {
  letter-spacing: -0.36px;
  line-height: 16px;
  min-width: 50%;
  white-space: nowrap;
}

.inter-medium-white-12px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
  opacity: 0.45;
  width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inter-medium-white-14px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
  text-overflow: ellipsis;
}

.group-49 {
  width: 100%;
}

.frame-33 {
  align-items: center;
  cursor: pointer;
}

.frame-2 {
  display: flex;
  width: inherit;
  justify-content: space-between;
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 14px;
  padding: 13px;
  background-color: var(--licorice);
}

.cosmos1vhw82tqftrg-1 {
  letter-spacing: -0.48px;
  line-height: 16px;
  white-space: nowrap;
  width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inter-medium-white-14px {
  color: white;
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}
</style>