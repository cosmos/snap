<script>
	import Balance from "../../components/Balance.svelte";
	import Transfer from "../../components/Transfer.svelte";

  export let balances = [
    {
      name: "Osmosis",
      dollarAmount: 16.75,
      tokenAmount: 48.77,
      tokenDenom: "OSMO",
      chainAddress: "osmo1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/mask-group-18@2x.png"
    },
    {
      name: "Cosmos Hub",
      dollarAmount: 1053.67,
      tokenAmount: 36.86,
      tokenDenom: "ATOM",
      chainAddress: "cosmos1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "/cosmos-atom-logo.png"
    },
    {
      name: "Stride",
      dollarAmount: 26.37,
      tokenAmount: 172.76,
      tokenDenom: "stATOM",
      chainAddress: "stride1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "/stride-logo.png"
    },
    {
      name: "Stride",
      dollarAmount: 1053.67,
      tokenAmount: 36.86,
      tokenDenom: "stOSMO",
      chainAddress: "stride1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7",
      logo: "/stride-logo.png"
    }
  ]
</script>

<div style="padding: 25px;">
  <div class="grid grid-cols-8 gap-[20px]">
    <div class="lg:col-span-5 col-span-8">
      <div class="chain-holding-distribution">
        Chains
      </div>
      <div class="mt-[20px] grid grid-cols-2 gap-[20px]">
        {#each balances as balance}
          <div class="col-span-2 lg:col-span-1">
            <Balance
              name={balance.name}
              dollarAmount={balance.dollarAmount}
              tokenAmount={balance.tokenAmount}
              tokenDenom={balance.tokenDenom}
              chainAddress={balance.chainAddress}
              logo={balance.logo}
            />
          </div>
        {/each}
      </div>
    </div>
    <div class="mt-[20px] lg:col-span-3 col-span-8">
      <Transfer />
    </div>
  </div>
</div>

<style>
.chain-holding-distribution {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: 20px;
  font-weight: 700;
}
</style>