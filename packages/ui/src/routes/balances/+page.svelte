<script lang="ts">
	import { onMount } from "svelte";
  import Balance from "../../components/Balance.svelte";
  import Transfer from "../../components/Transfer.svelte";
  import { balances } from "../../store/balances";
	import { fetchChains } from "../../store/chains";

  onMount(() => {
    fetchChains();
  });
</script>

<div style="padding: 25px;">
  <div class="grid grid-cols-8 gap-[20px]">
    <div class="lg:col-span-5 col-span-8">
      <div class="chain-holding-distribution">
        Balances
      </div>
      <div class="mt-[20px] grid grid-cols-2 gap-[20px]">
        {#each $balances as b}
          {#each b.balances as amount}
            <div class="balance col-span-2 lg:col-span-1">
              <Balance
                name={b?.pretty_name}
                dollarAmount={Math.round((Number(amount.amount) / 1000000) * 100) / 100}
                tokenAmount={Math.round((Number(amount.amount) / 1000000) * 100) / 100}
                tokenDenom={amount.denom}
                chainAddress={b?.address}
                logo={b.logo_URIs ? b.logo_URIs.svg : undefined}
              />
            </div>
          {/each}
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

.balance:hover {
  z-index: 100;
}
</style>