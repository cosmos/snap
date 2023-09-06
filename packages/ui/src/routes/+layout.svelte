<script>
	import Header from "../components/Header.svelte";
  import { state } from "../store/state";
  import { page } from '$app/stores';
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { fetchChains } from "../store/chains";
  import Alert from "../components/Alert.svelte";
  import "../app.css";
	import { getAddressBook } from "../store/addressbook";

  onMount(async () => {
    fetchChains();
    getAddressBook();
    if (!$state.connected) {
      goto("/");
    } else {
      if ($page.url.pathname == "/") {
        goto("/dashboard")
      }
    }
  })
</script>

<head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<Alert />
<div class="container">
  <Header
    connected={$state.connected}
    logoSrc="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/g10@2x.png" 
    logoText="MYSTIC LABS" 
    connectWalletTxt="Connect wallet"
  />
  <slot/>
</div>

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
      --licorice: #141414;
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
      min-width: 100vw;
    }

    @media (max-width: 1024px) { /* tablets, smaller laptops */
    }

    @media (max-width: 768px) { /* mobile devices */
      .container {
        flex-direction: column;
        min-height: 100vh;
      }
    }
</style>