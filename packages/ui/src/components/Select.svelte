<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';

  let isOpen = false;
  let shouldOpenUpwards = false;
  export let selectedItem :any = "";
  let dropdown: HTMLDivElement;
  export let items: any[] = [];
  let filteredItems: any[] = [];
  let searchQuery = '';
  const dispatch = createEventDispatcher();
  export let text = "Select Asset";
  export let showKey = "display";
  export let imageKey: string | undefined = undefined;

  // Filter items based on search query
  $: filteredItems = items.filter(item =>
    item[showKey].toLowerCase().includes(searchQuery.toLowerCase())
  );

  function selectItem(item: any) {
    selectedItem = item;
    isOpen = false;
    dispatch('change', selectedItem);
  }

  onMount(() => {
    window.addEventListener('resize', checkDropdownDirection);
  });

  afterUpdate(() => {
    if (isOpen === false) {
      searchQuery = '';
    }
  });

  function checkDropdownDirection() {
    if (dropdown) {
      const rect = dropdown.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      shouldOpenUpwards = spaceBelow < 200;
    }
  }
</script>

<div bind:this={dropdown} class="relative inline-block text-left w-full" class:z-[500]={isOpen}>
  <div>
    {#if isOpen}
      <!-- svelte-ignore a11y-autofocus -->
      <input 
        autofocus={true}
        type="text" 
        placeholder="Search..."
        class="mt-3 custom-bg inter-font inline-flex w-full rounded-[10px] border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35 cursor-pointer"
        bind:value={searchQuery}
        on:click={() => {
          isOpen = !isOpen;
          checkDropdownDirection();
        }}
      />
    {:else}
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
        {selectedItem[showKey] || `${text}`}
      </button>
    {/if}
  </div>

  {#if isOpen}
    <div
      class={`origin-top-right absolute right-0 ${shouldOpenUpwards ? 'bottom-full mb-3' : 'mt-2'} w-full rounded-md shadow-lg custom-bg text-white ring-1 ring-black ring-opacity-5 ${isOpen ? 'z-[500]' : ''} overflow-y-auto max-h-[200px] hide-scrollbar`}
    >
      <div
        class="py-1 inter-font"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        {#each searchQuery != '' ? filteredItems : items as item}
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="#" class="flex items-center px-4 py-2 hover:bg-[#ffffff17] hover:rounded-[10px] h-[40px]" on:click={() => selectItem(item)}>
            {#if imageKey}
              <img src={item[imageKey]} class="w-5 h-5 rounded-full mr-2" alt={item[showKey]} />
            {/if}
            {item[showKey]}
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
