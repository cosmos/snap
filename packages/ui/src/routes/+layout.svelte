<script lang="ts">
  import Connect from "../components/Connect.svelte";
	import Header from "../components/Header.svelte";
  import { state } from "../store/state";
  import Alert from "../components/Alert.svelte";
  import { onMount } from "svelte";
	import { updateDirectory } from "../store/directory";
	import { CosmosSnap } from "@cosmsnap/snapper";
	import { checkSnapPermissions, snapId } from "../utils/snap";
  import { appwrite_url, project_id } from "../utils/appwrite";

  onMount(async () => {
    window.cosmos = new CosmosSnap();
    window.cosmos.changeSnapId(snapId);
    await updateDirectory();
    $state.connected = await checkSnapPermissions();
    window.cosmos.setupAppwrite(appwrite_url!, project_id!);
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
    {#if !$state.currentMultiSig}
      <div class="h-full w-full mt-[75px]">
        <slot/>
      </div>
    {:else}
      <div class="right-content">
        <slot/>
      </div>
    {/if}
  {:else}
    <Connect /> 
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
      --akash: #FF414C;
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

    .right-content {
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

      .right-content {
        margin-left: 0px;
        height: auto;
      }
    }
</style>