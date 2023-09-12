<script lang="ts">
	import { onMount } from "svelte";
  import AddAddress from "../../components/AddAddress.svelte";
	import { getAddressBook, addressbook } from "../../store/addressbook.js";
	import { state } from "../../store/state.js";
	import { copyToClipboard } from "../../utils/general.js";
	import lunr from "lunr";
	import type { Address } from "@cosmsnap/snapper";

  let search_value = "";
  let searchResults: lunr.Index.Result[] = [];
  let currentAddresses: Address[] = $addressbook;
  let copied = false; 

  const idx = lunr(function () {
    // Use this ref function to get the id that will refer to each document
    this.ref('address');

    // Define fields to search in
    this.field('address');
    this.field('chain_id');
    this.field('name');

    $addressbook.forEach((doc) => {
      this.add({
        address: doc.address,
        chain_id: doc.chain_id,
        name: doc.name,
      });
    });
  });

  $: {
    searchResults = idx.search(search_value);
    currentAddresses = searchResults.map((result) => {
      return $addressbook.find((address: Address) => address.address === result.ref);
    }).filter(Boolean) as Address[];
    if (currentAddresses.length === 0) {
      currentAddresses = $addressbook
    }
  }

  const copyAddress = async (address: string) => {
    copied = true;
    await copyToClipboard(address);
    setTimeout(() => { copied = false; }, 1000);
  }

  onMount(() => {
    getAddressBook();
  })
</script>

<div class="w-full flex flex-col justify-center items-center h-full bg-[transparent]">
  <div hidden={!$state.openAddAddressPopup}>
    <AddAddress/>
  </div>
  <div class="rectangle-13">
    <div class="w-full flex justify-between mb-[20px]">
      <div class="chain-management">Address book</div>
      <button on:click={() => $state.openAddAddressPopup = true} class="connect-button button-text">
        Add address
      </button>
    </div>
    <input bind:value={search_value} placeholder="Type a keyword" class="search-input"/>    
    <div id="items-div" class="w-full overflow-scroll">
      {#each currentAddresses as address}
        <div class="group-4407">
          <div class="group-45">
            <div class="group-45-1">
              <img
                class="mask-group"
                src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64e665d9e1c2a81b98b3cc49/img/mask-group@2x.png"
                alt="Mask group"
              />
              <div class="group-4405">
                <div class="name-2 name-3 inter-bold-white-16px">
                  {address.name}
                </div>
                <div class="group-4400">
                  <div class="group-4537">
                    <div class="cosmos1vhw82tqftrg inter-medium-white-12px">
                      {address.address}
                    </div>
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <div class="cursor-pointer" on:click={() => copyAddress(address.address)}>
                        {#if copied}
                          <svg class="text-[#594bff] w-5 h-5 text-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 1v4a1 1 0 0 1-1 1H1m4 6 2 2 4-4m4-8v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
                          </svg>
                        {:else}
                          <svg class="text-[#594bff] w-5 h-5 text-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 5a1 1 0 0 0-1 1v12a.969.969 0 0 0 .933 1h8.1a1 1 0 0 0 1-1.033M10 1v4a1 1 0 0 1-1 1H5m10-4v12a.97.97 0 0 1-.933 1H5.933A.97.97 0 0 1 5 14V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 9.828 1h4.239A.97.97 0 0 1 15 2Z"/>
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

.inter-medium-white-12px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s2);
  font-style: normal;
}

.inter-bold-white-16px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-l2);
  font-style: normal;
  font-weight: 700;
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

.cosmos1vhw82tqftrg {
  line-height: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden; 
  max-width: 300px;
}

.name-2 {
  width: 100%;
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

.connect-button {
  align-items: center;
  background-color: var(--blueberry);
  border-radius: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  overflow: hidden;
  padding: 13px 23px;
  height: 35px;
}

.connect-button:hover {
  background-color: var(--blueberry);
  filter: brightness(1.1);
}

.button-text {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s);
  font-style: normal;
  font-weight: 500;
}

.search-input {
  align-items: flex-end;
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  gap: 98px;
  width: 100%;
  padding: 10px 18px;
  font-family: var(--font-family-inter);
  color: white;
  height: 42px;
}

.search-input:focus-visible {
  align-items: flex-end;
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  gap: 98px;
  width: 100%;
  padding: 10px 18px;
  font-family: var(--font-family-inter);
  color: white;
}

input:active {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.10);
  border-radius: 8px;
}

input:focus {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.10);
  border-radius: 8px;
}

input:focus-visible {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.10);
  border-radius: 8px;
}
</style>