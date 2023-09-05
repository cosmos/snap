<script lang="ts">
	import Balance from "../../components/Balance.svelte";
	import Transfer from "../../components/Transfer.svelte";
	import { state } from "../../store/state";
  import { chains, fetchAllClients } from "../../store/chains";
	import { onMount } from "svelte";
	import type { ChainClient } from "../../utils/chains";

  let allChains: (ChainClient | null)[] = [];

  $: {
    allChains = $chains;
    console.log(allChains);
  }

  onMount(async () => {
    await fetchAllClients();
    console.log("All Clients Created...");
  });

  export let balancesOld = [
    {
      name: "Osmosis",
      dollarAmount: 16.75,
      tokenAmount: 48.77,
      tokenDenom: "OSMO",
      chainAddress: "osmo1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/mask-group-18@2x.png"
    },
    {
      name: "Cosmos Hub",
      dollarAmount: 1053.67,
      tokenAmount: 36.86,
      tokenDenom: "ATOM",
      chainAddress: "cosmos1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "/cosmos-atom-logo.png"
    },
    {
      name: "Stride",
      dollarAmount: 26.37,
      tokenAmount: 172.76,
      tokenDenom: "stATOM",
      chainAddress: "stride1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "/stride-logo.png"
    },
    {
      name: "Stride",
      dollarAmount: 1053.67,
      tokenAmount: 36.86,
      tokenDenom: "stOSMO",
      chainAddress: "stride1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "/stride-logo.png"
    }
  ]
</script>

<div hidden={!$state.showAlert} style="font-family: 'Inter'; position: fixed; right: 10px; bottom: 0px; z-index: 1000;">
  <div id="toast-success" class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
        </svg>
        <span class="sr-only">Check icon</span>
    </div>
    <div class="ml-3 text-sm font-normal">{$state.alertText}</div>
    <button on:click={() => { $state.showAlert = false; $state.alertText = "";}} type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
        <span class="sr-only">Close</span>
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
    </button>
  </div>
</div>
<div style="padding: 25px;">
  <div class="grid grid-cols-8 gap-[20px]">
    <div class="lg:col-span-5 col-span-8">
      <div class="chain-holding-distribution">
        Chains
      </div>
      <div class="mt-[20px] grid grid-cols-2 gap-[20px]">
        {#each balancesOld as balance}
          <div class="balance col-span-2 lg:col-span-1">
            <Balance
              name={balance.name}
              dollarAmount={balance.dollarAmount}
              tokenAmount={balance.tokenAmount}
              tokenDenom={balance.tokenDenom}
              chainAddress={balance.chainAddress}
              logo={balance.logo}
            />
          </div>
        {/each}
      </div>
    </div>
    <div class="mt-[20px] lg:col-span-3 col-span-8">
      <Transfer />
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

.balance:hover {
  z-index: 100;
}
</style>