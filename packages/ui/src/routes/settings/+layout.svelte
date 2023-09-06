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