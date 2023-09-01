<script>
  import Menu from "../../components/Menu.svelte";
  import { state } from "../../store/state";
</script>

<head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<div class="container">
  <div hidden={!$state.connected} class="left-content">
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

    .left-content {
      backdrop-filter: blur(15px) brightness(100%);
      background-color: var(--licorice);
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
      overflow-y: auto;
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
        display: none;
      }

      .right-content {
        margin-left: 0px;
        height: auto;
      }
    }
</style>