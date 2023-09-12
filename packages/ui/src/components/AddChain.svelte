<script lang="ts">
  import { JSONEditor, Mode } from 'svelte-jsoneditor';
  import { state } from '../store/state';
  import { ADD_CHAIN_EXAMPLE } from '../utils/constants';
	import type { ChainInfo } from '@keplr-wallet/types';
	import { validateChainInfo } from '../utils/general';
  import Button from './Button.svelte';
	import { fetchChains } from '../store/chains';

  export let chainInfo: ChainInfo = ADD_CHAIN_EXAMPLE;
  let content = { text: undefined, json: chainInfo as any };
  let loading = false;

  const addChain = async () => {
    try {
      loading = true;
      let good = validateChainInfo(chainInfo);
      if (!good) {
        $state.alertType = "danger";
        $state.alertText = "Chain info is not supplied properly.";
        $state.showAlert = true;
        loading = false;
        throw new Error("Chain info is not supplied properly.")
      }
      await window.cosmos.experimentalSuggestChain(chainInfo);
      await fetchChains();
      loading = false;
    } catch (err) {
      console.error(err);
      loading = false;
      // @ts-ignore
      $state.alertText = err.message;
      $state.alertType = "danger";
      $state.showMenu = true;
    }
  }

  function handleChange(updatedContent: any, previousContent: any, { contentErrors, patchResult }: any) {
    content = updatedContent;
    chainInfo = updatedContent.json;
  }
</script>
  
  <div class="rectangle-66">
      <div class="group-4449">
          <div class="group-4448">
              <div class="group-4446">
                  <div class="group-4444">
                      <div class="add-new-chain-1 inter-bold-white-20px">
                        Add new chain
                      </div>
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <img on:click={() => $state.openAddChainPopup = false} class="clear" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64ef9c2985c1bf1a9cb5beba/img/clear@2x.png" alt="clear">
                  </div>
                  <img class="line-5 line" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64ef9c2985c1bf1a9cb5beba/img/line-5.png" alt="Line 5">
              </div>
                  <div class="group-4447">
                    <div class="group-4445">
                      <div class="overlap-group jse-theme-dark">
                        <JSONEditor onChange="{handleChange}" content={content} mainMenuBar={false} navigationBar={false} statusBar={false} mode={Mode.tree}/>
                      </div>
                  </div>
                  <Button onClick={addChain} text="Add chain" bind:loading={loading}/>
              </div>
          </div>
      </div>
  </div>
  
  <style>
  @import 'svelte-jsoneditor/themes/jse-theme-dark.css';

  .rectangle-66 {
      z-index: 100;
      backdrop-filter: blur(15px) brightness(100%);
      background-color: #05000bbf;
      left: 0;
      position: fixed;
      top: 0;
      width: 100vw;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 25px;
  }
  
  .group-4449 {
    align-items: flex-start;
    backdrop-filter: blur(15px) brightness(100%);
    background-color: var(--licorice);
    border: 1px solid;
    border-color: var(--white-2);
    border-radius: 20px;
    display: flex;
    height: 100%;
    width: 85%;
  }
  
  .group-4448 {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  
  .group-4446 {
    align-items: center;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .group-4444 {
    align-items: flex-start;
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 25px;
  }
  
  .add-new-chain-1 {
    letter-spacing: -0.6px;
    line-height: normal;
    min-height: 24px;
    min-width: 137px;
    white-space: nowrap;
  }
  
  .inter-bold-white-20px {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-xl);
    font-style: normal;
    font-weight: 700;
  }
  
  .clear {
    height: 24px;
    width: 24px;
    cursor: pointer;
  }
  
  .line-5 {
    width: 100%;
  }
  
  .group-4447 {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 30px;
  }
  
  .group-4445 {
      align-items: center;
      display: flex;
      width: 100%;
      justify-content: center;
      height: 100%;
  }
  
  .overlap-group {
    align-items: flex-start;
    backdrop-filter: blur(15px) brightness(100%);
    background-color: var(--licorice);
    border: 1px solid;
    border-color: var(--white-2);
    border-radius: 16px;
    display: flex;
    height: 100%;
    width: 100%;
    padding: 25px;
    min-height: 330px;
    font-family: var(--font-family-inter);
    color: var(--white);
    overflow-y: scroll;
    max-height: 375px;
    /* Variables Editor */
    --jse-theme-color: transparent;
    --jse-theme-color-highlight: transparent;
  }
  
  .overlap-group:focus {
    align-items: flex-start;
    backdrop-filter: blur(15px) brightness(100%);
    background-color: var(--licorice);
    border: 1px solid;
    border-color: var(--white-2);
    border-radius: 16px;
    display: flex;
    height: 100%;
    width: 100%;
    padding: 25px;
    min-height: 330px;
    font-family: var(--font-family-inter);
    color: var(--white);
    overflow-y: scroll;
    max-height: 375px;
  }
  
  .overlap-group:focus-visible {
    align-items: flex-start;
    backdrop-filter: blur(15px) brightness(100%);
    background-color: var(--licorice);
    border: 1px solid;
    border-color: var(--white-2);
    border-radius: 16px;
    display: flex;
    height: 100%;
    width: 100%;
    padding: 25px;
    min-height: 330px;
    font-family: var(--font-family-inter);
    color: var(--white);
    overflow-y: scroll;
    max-height: 375px;
  }
</style>