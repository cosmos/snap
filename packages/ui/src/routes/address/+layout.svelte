<script>
  import Menu from "../../components/Menu.svelte";
  import { state } from "../../store/state";
</script>

<head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<div class="container">
  <div hidden={!$state.showMenu} class="left-content">
    <Menu />
  </div>
  <div class="right-content">
    <slot/>
  </div>
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
      --licorice: #14141473;
      --blueberry: #594bff;
      --eerie-black: #1b1721;
      --font-size-xl: 20px;
      --font-size-m: 14px;
      --font-size-l: 16px;
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