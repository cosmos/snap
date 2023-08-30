<script>
  import Grid from "gridjs-svelte";

  let columns = [{
      id: '#',
      name: '#'
    }, 
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

  const data = [
    { '#': 1, address: "osmo1vhw8...2tqftrg", chain: "Osmosis", tx_hash: 8746613, when: "21 Apr 07:15:58" },
    { '#': 2, address: "cosmos1vhw8...2tqftrg", chain: "Cosmos Hub", tx_hash: 7466, when: "05 May 18:36:14" },
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

<style>
  #main-grid-container {
    padding: 25px;
  }

  .tx-title {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: 20px;
    font-weight: 700;
    position: relative;
    top: 40px;
  }
</style>