<script lang="ts">
  import type { Chain } from "@cosmsnap/snapper";
  import { chains } from "../store/chains";

  let isOpen = false;
  export let selectedChain = "";

  function selectChain(chain: Chain) {
    selectedChain = chain.chain_id;
    isOpen = false;
  }
</script>

<div class="relative inline-block text-left w-full">
  <div>
    <button
      type="button"
      class="custom-bg inter-font inline-flex w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-custom-bg focus:ring-white"
      id="options-menu"
      aria-haspopup="true"
      aria-expanded="true"
      on:click={() => (isOpen = !isOpen)}
    >
      {selectedChain || "Select a Chain"}
    </button>
  </div>

  {#if isOpen}
    <div
      class="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg custom-bg text-white ring-1 ring-black ring-opacity-5 z-10"
    >
      <div
        class="py-1 inter-font"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        {#each $chains as chain (chain)}
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="#" class="flex items-center px-4 py-2" on:click={() => selectChain(chain)}>
            {#if chain.logo_URIs?.svg}
              <!-- svelte-ignore a11y-missing-attribute -->
              <img src={chain.logo_URIs?.svg} class="w-5 h-5 rounded-full mr-2" alt={chain.chain_id} />
            {:else}
              <!-- svelte-ignore a11y-missing-attribute -->
              <img src="https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg" class="w-5 h-5 rounded-full mr-2" alt={chain.chain_id} />
            {/if}
            {chain}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  :root {
    background-color: black;
  }
  .inter-font {
    font-family: "Inter", sans-serif;
  }
  .custom-bg {
    background-color: #141414;
  }
  .focus\:ring-offset-custom-bg:focus {
    --tw-ring-offset-color: #141414;
  }
</style>