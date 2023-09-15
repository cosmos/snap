<script lang="ts">
	import Header from "../components/Header.svelte";
  import { state } from "../store/state";
  import { page } from '$app/stores';
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Alert from "../components/Alert.svelte";
	import Menu from "../components/Menu.svelte";
	import { updateDirectory } from "../store/directory";
	import { CosmosSnap, isSnapInitialized, isSnapInstalled } from "@cosmsnap/snapper";
	import { isMetaMaskInstalled, snapId } from "../utils/snap";

	const initializeData = async () => {
    try {
      $state.loading = true;
      $state.isMetaMaskInstalledValue = isMetaMaskInstalled() ?? false;
      $state.loading = false;
      if ($state.isMetaMaskInstalledValue) {
        $state.loading = true;
        $state.isSnapInstalledValue = await isSnapInstalled();
        $state.loading = false;
      }
      if ($state.isSnapInstalledValue) {
        $state.loading = true;
        $state.isSnapInitValue = await isSnapInitialized();
        $state.loading = false;
      }
      if ($state.isMetaMaskInstalledValue && $state.isSnapInstalledValue && $state.isSnapInitValue ) {
        $state.connected = true;
      }
     } catch (err: any) {
      $state.loading = false;
      $state.alertText = `${err.message}`
      $state.alertType = "danger"
      $state.showAlert = true
    }
	};

  onMount(async () => {
    window.cosmos = new CosmosSnap();
    window.cosmos.changeSnapId(snapId);
    updateDirectory();
    await initializeData();
    if (!$state.connected) {
      goto("/");
    } else {
      if ($page.url.pathname == "/") {
        goto("/balances")
      }
    }
  });
</script>

<head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<div class="container">
<Header
  connected={$state.connected}
  logoSrc="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/g10@2x.png" 
  logoText="MYSTIC LABS" 
  connectWalletTxt="Connect wallet"
/>
  {#if $state.connected}
      <div hidden={!$state.showMenu} class="left-content">
        <Menu />
      </div>
      <div class="right-content">
        <slot/>
      </div>
  {:else} 
    <slot/>
  {/if}
</div>
<Alert />

<style>
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    @import 'tailwindcss/utilities';    
    @import url("https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css");
    @import url("https://fonts.googleapis.com/css?family=Inter:500,700");

    :root {
      --black: #000000;
      --white-2: #ffffff1a;
      --white: #ffffff;
      --licorice: #14141473;
      --blueberry: #594bff;
      --eerie-black: #1b1721;
      --font-size-xl: 20px;
      --font-size-m: 14px;
      --font-size-l: 16px;
      --font-size-xl: 20px;
      --font-size-s: 12px;
      --font-size-xxl: 32px;
      --font-family-inter: "Inter", Helvetica;
    }

    .container {
      display: flex;
      background-color: #05000b;
      border: 1px none;
      min-height: 100vh;
      min-width: 100%;
    }

    .left-content {
      backdrop-filter: blur(15px) brightness(100%);
      background-color: #05000b;
      border: 1px solid;
      border-color: var(--white-2);
      border-top: 0px;
      position: fixed;
      left: 0;
      top: 0;
      height: 100%;
      width: 200px;
      margin-top: 75px;
    }

    .right-content {
      margin-left: 200px; 
      flex-grow: 1;
      overflow: clip;
      margin-top: 75px;
    }

    @media (max-width: 1024px) { /* tablets, smaller laptops */
    }

    @media (max-width: 768px) { /* mobile devices */
      .container {
        flex-direction: column;
        min-height: 100vh;
      }

      .left-content {
        display: flex;
        position: fixed;
        z-index: 1000;
        width: 100%;
        justify-content: center;
      }

      .right-content {
        margin-left: 0px;
        height: auto;
      }
    }
</style>