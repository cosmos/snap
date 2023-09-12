<script lang="ts">
  import Grid from "gridjs-svelte";
  import TxMobile from "../../components/TxMobile.svelte";
  import { transactions } from "../../store/transactions.js";
	import { onMount } from "svelte";

  let data: any[] = [];

  const setTransactions = async () => {
    data = await $transactions
  }

  onMount(() => {
    setTransactions();
    if (!data) { data = []; }
  })

  let columns = [
    {
      id: 'address',
      name: 'Address'
    }, 
    {
      id: 'chain',
      name: 'Chain'
    }, 
    {
      id: 'tx_hash',
      name: 'Transaction ID'
    }, 
    {
      id: 'when',
      name: 'When'
    }
  ]

  let config = {
    container: "main-grid-container",
    paginationButtonNext: "next-button",
    paginationButtonPrev: "prev-button",
    paginationButtonCurrent: "current-button"
  }

  let style = {
    table: {
      'background-color': '#14141473',
      'height': '505px',
      'border-radius': '8px'
    },
    container: {
      'background-color': 'transparent',
      'color': '#fff',
      'text-align': 'center',
      'font-family': 'var(--font-family-inter)'
    },
    th: {
      'background-color': '#141414',
      'color': '#fff',
      'text-align': 'center',
      'font-family': 'var(--font-family-inter)',
      'border': 'none',
      'opacity': '0.35',
      'font-weight': '500'
    },
    td: {
      'background-color': 'transparent',
      'color': '#fff',
      'text-align': 'center',
      'font-family': 'var(--font-family-inter)',
      'border': 'none',
      'vertical-align': 'middle'
    },
    tr: {
      'background-color': 'transparent',
      'color': '#fff',
      'text-align': 'center',
      'font-family': 'var(--font-family-inter)'
    },
    footer: {
      'background-color': 'transparent',
      'color': 'white',
      'border': 'none'
    },
    summary: {
      'color': 'white'
    },
    search: {
      'background-color': 'transparent',
      'color': '#fff',
      'text-align': 'center',
      'font-family': 'var(--font-family-inter)'
    }
  }
</script>

<div id="main-grid-container">
  <div class="tx-title">Transaction history</div>
  <Grid data={data} sort={true} search={true} pagination={true} className={config} style={style} columns={columns}/>
</div>
<div id="main-grid-container-mobile">
  <div class="tx-title-mobile">Transaction history</div>
  <div class="table-div">
    {#each data as tx}
      <TxMobile data={tx}/>
    {/each}
  </div>
</div>

<style>
  #main-grid-container {
    padding: 25px;
  }

  .table-div {
    margin-top: 20px;
    display: flex;
    gap: 20px;
    flex-direction: column;
  }

  .tx-title {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: 20px;
    font-weight: 700;
    position: relative;
    top: 40px;
  }

  .tx-title-mobile {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: 20px;
    font-weight: 700;
    display: flex;
    gap: 20px;
    justify-content: center;
  }

  @media (min-width: 772px) {
    #main-grid-container {
      display: block;
      padding: 25px;
    }
    #main-grid-container-mobile {
      display: none;
      padding: 25px;
    }
  }

  @media (max-width: 772px) { /* mobile devices */
    #main-grid-container {
      display: none;
      padding: 25px;
    }
    #main-grid-container-mobile {
      display: block;
      padding: 25px;
    }
  }
</style>