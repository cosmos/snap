<script lang="ts">
  import Balance from "../../components/Balance.svelte";
  import Transfer from "../../components/Transfer.svelte";
  import { state } from "../../store/state";
  import { balances } from "../../store/balances";
  import { onMount } from 'svelte';
	import { chains } from "../../store/chains";

  onMount(async () => {
    try {
      if ($balances.length === 0) {
        const res = await fetch('/api/balances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chains: $chains })
        });

        if (!res.ok) {
          throw new Error("HTTP error " + res.status);
        }

        const data = await res.json();
        console.log(data);
        $balances = data.body.balances;
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  });
</script>

<div style="padding: 25px;">
  <div class="grid grid-cols-8 gap-[20px]">
    <div class="lg:col-span-5 col-span-8">
      <div class="chain-holding-distribution">
        Chains
      </div>
      <div class="mt-[20px] grid grid-cols-2 gap-[20px]">
        {#each $balances as b}
          {#each b['balances'] as amount}
            <div class="balance col-span-2 lg:col-span-1">
              <Balance
                name={b?.pretty_name}
                dollarAmount={Math.round((Number(amount.amount) / 1000000) * 100) / 100}
                tokenAmount={Math.round((Number(amount.amount) / 1000000) * 100) / 100}
                tokenDenom={amount.denom.split("u")[1]}
                chainAddress={b?.address}
                logo={b?.logo_URIs.svg}
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