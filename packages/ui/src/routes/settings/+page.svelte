<script lang="ts">
  import { chains } from '../../store/chains.js';
  import AddChain from '../../components/AddChain.svelte';
	import { state } from "../../store/state.js";
	import { deleteChain } from '../../utils/snap.js';
  import lunr from 'lunr';
	import type { Chain } from '@cosmsnap/snapper';

  let searchResults: lunr.Index.Result[] = [];
  let currentChains: Chain[] = $chains;
  let term = "";

  const idx = lunr(function () {
    // Use this ref function to get the id that will refer to each document
    this.ref('chain_id');

    // Define fields to search in
    this.field('chain_name');
    this.field('chain_id');
    this.field('pretty_name');

    $chains.forEach((doc) => {
      this.add({
        chain_name: doc.chain_name,
        chain_id: doc.chain_id,
        pretty_name: doc.pretty_name,
      });
    });
  });

  $: {
    searchResults = idx.search(term);
    currentChains = searchResults.map((result) => {
      return $chains.find((chain: Chain) => chain.chain_id === result.ref);
    }).filter(Boolean) as Chain[];
    if (currentChains.length === 0) {
      currentChains = $chains
    }
  }

  const deleteChainFromSnap = async (chain_id: string) => {
    deleteChain(chain_id);
  }
</script>

<div hidden={!$state.openAddChainPopup}>
  <AddChain/>
</div>
<div style="padding: 25px;">
  <div class="top-box">
    <div class="title">
      Settings
    </div>
    <div style="display: flex; height: 40px;">
      <input bind:value={term} placeholder="Search chain" class="search-chain"/>
      <button on:click={() => { $state.openAddChainPopup = true; }} class="add-chain-button button-text">Add chain</button>
    </div>
  </div>
  <div class="mt-[20px] grid grid-cols-2 gap-[20px]">
    {#each currentChains as chain}
      <div class="col-span-2 lg:col-span-1">
        <div class="group-85">
          <div class="group-84">
            <div class="group-28">
              <!-- svelte-ignore a11y-missing-attribute -->
              {#if chain.logo_URIs}
                <img class="group-46" src={chain.logo_URIs.svg}/>
              {:else}
                <img class="group-46" src="https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg"/>
              {/if}
            </div>
            <div class="osmosis inter-bold-white-20px">
              {chain.pretty_name}
            </div>
          </div>
          <div class="group-4450">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <img on:click={() => deleteChainFromSnap(chain.chain_id)} class="delete_outline cursor-pointer" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a710c1420c7281d1d60ffb/img/delete-outline.svg" alt="delete_outline">
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
.search-chain {
    align-items: flex-end;
    background-color: var(--licorice);
    border: 1px solid;
    border-color: var(--white-2);
    border-radius: 10px;
    display: flex;
    gap: 98px;
    min-width: 250px;
    padding: 10px 18px;
    font-family: var(--font-family-inter);
    color: var(--white);
    font-size: var(--font-size-s);
    font-style: normal;
    font-weight: 500;
}

.search-chain:focus {
    align-items: flex-end;
    background-color: var(--licorice);
    border: 1px solid;
    border-color: var(--white-2);
    border-radius: 10px;
    display: flex;
    gap: 98px;
    min-width: 250px;
    padding: 10px 18px;
    font-family: var(--font-family-inter);
    color: var(--white);
    font-size: var(--font-size-s);
    font-style: normal;
    font-weight: 500;
    box-shadow: none;
}

.button-text {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s);
  font-style: normal;
  font-weight: 500;
}

.add-chain-button {
  align-items: center;
  background-color: var(--blueberry);
  border-radius: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  overflow: hidden;
  padding: 13px 23px;
  margin-left: 10px;
}

.add-chain-button:hover {
  background-color: var(--blueberry);
  filter: brightness(1.1);
}

.top-box {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 40px;
}

.title {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: 20px;
  font-weight: 700;
}

.group-85 {
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 14px;
  display: flex;
  gap: 14px;
  height: 85px;
  width: 100%;
  padding: 17px 16px;
}

.group-84 {
  align-items: center;
  display: flex;
  gap: 15px;
  width: 100%;
}

.group-28 {
  align-items: center;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 24px;
  display: flex;
  height: 48px;
  min-width: 48px;
  padding: 2.1px 2.1px;
  justify-content: center;
}

.group-46 {
  backdrop-filter: blur(15px) brightness(100%);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 19.9px;
  height: 40px;
  width: 40px;
}

.osmosis {
  letter-spacing: -0.6px;
  line-height: normal;
  margin-bottom: 2px;
  min-height: 24px;
  white-space: nowrap;
}

.inter-bold-white-20px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-xl);
  font-style: normal;
  font-weight: 700;
}

.group-4450 {
  align-items: center;
  align-self: center;
  display: flex;
  gap: 10px;
  margin-bottom: 3px;
  width: 100%;
  justify-content: flex-end;
}
</style>