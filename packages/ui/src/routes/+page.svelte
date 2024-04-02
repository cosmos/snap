<script lang="ts">
  import { beforeUpdate, onMount } from "svelte";
  import Multisig from "../components/Multisig.svelte";
  import { chains, fetchChains } from "../store/chains";
  import { updateDirectory } from "../store/directory";
	import { state } from "../store/state";
	import { getMultiSigs, type Multisig as MultiSig } from "../utils/appwrite";
  import { toBase64 }from "@cosmjs/encoding";

  let multisigs: MultiSig[] = [];

  $: {
    if (!$chains) {
      $state.alertType = "warning"
      $state.alertText = "Generating your keys. This can take a minute."
      $state.showAlert = true
    } else {
      $state.showAlert = false
    }
  }

  onMount(async () => {
    if ($state.connected) {
      await fetchChains();
      const account = await window.cosmos.getAccount("akashnet-2");
      const b64Pk = toBase64(new Uint8Array(Object.values(account.pubkey)));
      multisigs = await getMultiSigs(b64Pk);
      console.log(multisigs);
    }
  });
  beforeUpdate(updateDirectory);
</script>

<div style="padding: 25px;">
  <div class="grid grid-cols-8 gap-[20px]">
    <div class="lg:col-span-8 col-span-8">
      <div class="chain-holding-distribution">
        My Multisigs
      </div>
      <div class="mt-[20px] grid grid-cols-5 gap-[20px]">
        {#each multisigs as ms}
          <div class="balance col-span-2 lg:col-span-1 cursor-pointer">
            <Multisig
              name={ms.name}
              threshold={ms.threshold}
              publicKey={ms.public_key}
              memberCount={ms.members.length}
            />
          </div>
        {/each}
        <div class="cursor-pointer flex flex-col items-center justify-center p-5 border-2 border-solid border-[#ffffff2e] rounded-lg w-full min-h-[170px] bg-[var(--licorice)]">
          <div>
            <svg class="w-10 h-10 text-[#FF414C]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/>
            </svg>                
          </div>
          <div class="mt-4 text-white font-inter font-medium">Add Multisig</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .chain-holding-distribution {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: 20px;
    font-weight: 700;
  }
</style>