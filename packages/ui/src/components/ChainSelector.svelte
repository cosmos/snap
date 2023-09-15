<script lang="ts">
  import { onMount } from 'svelte';
  import type { Chain } from "@cosmsnap/snapper";
  import { chains } from "../store/chains";

  let isOpen = false;
  let shouldOpenUpwards = false;
  export let selectedChain = "";
  let selectedPrettyName = "";
  let dropdown: HTMLDivElement;
  export let onChange = () => {};

  function selectChain(chain: Chain) {
    selectedChain = chain.chain_id;
    onChange();
    isOpen = false;
  }

  onMount(() => {
    window.addEventListener('resize', checkDropdownDirection);
  });

  function checkDropdownDirection() {
    if (dropdown) {
      const rect = dropdown.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      shouldOpenUpwards = spaceBelow < 200;
    }
  }

  $: {
    if (selectedChain) {
      let chainCurrent = $chains.find(item => item.chain_id == selectedChain)
      if (chainCurrent) {
        selectedPrettyName = chainCurrent.pretty_name
      }
    }
  }
</script>

<div bind:this={dropdown} class="relative inline-block text-left w-full z-[500]">
  <div>
    <button
      type="button"
      class="mt-3 custom-bg inter-font inline-flex w-full rounded-[10px] border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35"
      id="options-menu"
      aria-haspopup="true"
      aria-expanded="true"
      on:click={() => {
        isOpen = !isOpen;
        checkDropdownDirection();
      }}
    >
      {selectedPrettyName || "Select a Chain"}
    </button>
  </div>

  {#if isOpen}
    <div
      class={`origin-top-right absolute right-0 ${shouldOpenUpwards ? 'bottom-full mb-3' : 'mt-2'} w-full rounded-md shadow-lg custom-bg text-white ring-1 ring-black ring-opacity-5 z-[500] overflow-y-auto max-h-[200px] hide-scrollbar`}
    >
      <div
        class="py-1 inter-font"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        {#each $chains as chain (chain)}
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="#" class="flex items-center px-4 py-2 hover:bg-[#ffffff17] hover:rounded-[10px] h-[40px]" on:click={() => selectChain(chain)}>
            {#if chain.logo_URIs?.svg}
              <img src={chain.logo_URIs?.svg} class="w-5 h-5 rounded-full mr-2" alt={chain.chain_id} />
            {:else}
              <img src="https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg" class="w-5 h-5 rounded-full mr-2" alt={chain.chain_id} />
            {/if}
            {chain.pretty_name}
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
    --tw-border-opacity: 0.35;
  }
  .hide-scrollbar {
    scrollbar-width: none;  /* For Firefox */
    -ms-overflow-style: none;  /* For Internet Explorer and Edge */
  }
  .hide-scrollbar::-webkit-scrollbar {
    width: 0px;  /* For Chrome, Safari, and Opera */
  }
</style>