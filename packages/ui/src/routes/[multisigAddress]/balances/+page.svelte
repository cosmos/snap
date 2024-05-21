<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import Balance from "../../../components/Balance.svelte";
  import Transfer from "../../../components/Transfer.svelte";
  import { balances } from "../../../store/balances";
  import { chains, fetchChains } from "../../../store/chains";
  import BalanceLoader from "../../../components/BalanceLoader.svelte";
	import { state } from "../../../store/state";
	import type { Multisig } from "../../../utils/appwrite";
	import Button from "../../../components/Button.svelte";
	import { getClient } from "../../../utils/tx";
	import { toBase64 } from "@cosmjs/encoding";
	import { addTransaction } from "../../../store/transactions";
	import { sendTxAlert } from "../../../../../snapper/src";
	import { snapId } from "../../../utils/snap";
	import type { StdFee } from "@cosmjs/amino";
	import Confirm from "../../../components/Confirm.svelte";

  let loading = false;
  let showPendingTxDisabled = true;
  let openDeleteTx = false;

  $: {
    if (!$chains) {
      $state.alertType = "warning"
      $state.alertText = "Generating your keys. This can take a minute."
      $state.showAlert = true
    } else {
      $state.showAlert = false
    }
  }

  const onYesClick = async () => {
    openDeleteTx = false;
  }

  const onNoClick = async () => {
    openDeleteTx = false;
  }

  const onClose = async () => {
    openDeleteTx = false;
  }

  const signMultisisTx = async () => {
    try {
      loading = true;
      const chain = $chains.find((c) => c.chain_id === $state.currentMultiSig.transactions[0].chain_id);
      if (!chain) {
        throw new Error(`Chain with chain id ${$state.currentMultiSig.transactions[0].chain_id} not found. Please add the chain to proceed.`);
      }
      const client = await getClient(chain);

      const account = await window.cosmos.getAccount(chain.chain_id);

      const msAccount = await client.getSequence(chain.address!);
      const signerData = {
        accountNumber: msAccount.accountNumber,
        sequence: msAccount.sequence,
        chainId: chain.chain_id,
      };
      const messages = $state.currentMultiSig.transactions[0].messages.map((m: string) => JSON.parse(m));
      const fee: StdFee = JSON.parse($state.currentMultiSig.transactions[0].fee);
      const sig = await client.sign(account.address, messages, fee, "", signerData);
      const base64Signature = toBase64(sig.signatures[0]);
      const tx = await window.cosmos.signPendingMultisigTx($state.currentMultiSig.public_key, chain.apis.rpc[0].address, fee, chain.bech32_prefix, base64Signature, account.address);
      loading = false;
      if ('code' in tx) {
          if (tx.code == 0) {
              await addTransaction({address: chain.address!, chain: chain.chain_id, when: new Date().toLocaleString(), tx_hash: tx.transactionHash});
              await sendTxAlert(chain.chain_name, tx.transactionHash, snapId);
          } else {
              if (tx.rawLog) {
                  $state.alertText = tx.rawLog
              } else {
                  $state.alertText = "There was an issue while submitting your transaction. View explorer for more details."
              }
              $state.alertType = "danger"
              $state.showAlert = true
          }
      }
      if ('signer_count' in tx) {
          $state.alertText = `Multisig transaction was created. There are currently ${tx.signer_count} signers of the transaction with ${tx.threshold} needed. Have the other signers complete the transaction to execute.`
          $state.alertType = "success"
          $state.showAlert = true
      }
    } catch (e: any) {
      console.error(e);
      $state.alertText = e.message;
      $state.alertType = "danger";
      $state.showAlert = true;
      loading = false;
    }
  };

  onMount(async () => {
    if ($state.connected) {
      fetchChains($state.currentMultiSig as Multisig)
    }
    if ($state.currentMultiSig.transactions.length > 0) {
      let account = await window.cosmos.getAccount($state.currentMultiSig.transactions[0].chain_id);
      if ($state.currentMultiSig.transactions[0].signatures.some((sig: string) => sig.includes(account.address))) {
        showPendingTxDisabled = true;
      }
      showPendingTxDisabled = false;
    }
  });

  afterUpdate(async () => {
    if ($state.currentMultiSig.transactions.length > 0) {
      let account = await window.cosmos.getAccount($state.currentMultiSig.transactions[0].chain_id);
      if ($state.currentMultiSig.transactions[0].signatures.some((sig: string) => sig.includes(account.address))) {
        showPendingTxDisabled = true;
      }
      showPendingTxDisabled = false;
    }
  })
</script>

<div style="padding: 25px;">
  <div class="grid grid-cols-8 gap-[20px]">
    <div class="lg:col-span-5 col-span-8">
      {#if $state.currentMultiSig.transactions.length > 0}
        <div class="flex justify-end w-full">
          <div class=" w-2/3 chain-holding-distribution">
            Pending Multisig Transaction
          </div>
          <div class="w-1/3 flex w-full justify-end">
            <svg on:click={() => { openDeleteTx = true }} class="w-6 h-6 text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
            </svg> 
          </div>
        </div>  
        <div class="chain-holding-distribution">
          <div class="w-1/2">
            <Button disabled={!showPendingTxDisabled} loading={loading} onClick={signMultisisTx} text={showPendingTxDisabled ? "Sign Transaction" : "Already Signed"} />
          </div>
        </div>
      {/if}
      <div class="chain-holding-distribution mt-7">
        Balances
      </div>
      <div class="mt-[20px] grid grid-cols-2 gap-[20px]">
        {#if $balances.length > 0}
          {#each $balances as b}
            {#each b.balances as amount}
              <div class="balance col-span-2 lg:col-span-1">
                <Balance
                  name={b?.pretty_name}
                  chain_id={b.chain_id}
                  tokenAmount={Math.round((Number(amount.amount) / 1_000_000) * 100) / 100}
                  tokenDenom={amount.display}
                  chainAddress={b?.address ?? ""}
                  logo={b.logo_URIs ? b.logo_URIs.svg : "/cosmos-atom-logo.png"}
                />
              </div>
            {/each}
          {/each}
        {:else}
          {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as i}
            <BalanceLoader />
          {/each}
        {/if}
      </div>
    </div>
    <div class="mt-[20px] lg:col-span-3 col-span-8">
      <Transfer />
    </div>
  </div>
</div>
<Confirm bind:show={openDeleteTx} onYesClick={onYesClick} onNoClick={onNoClick} onClose={onClose}/>

<style>
  .chain-holding-distribution {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: 20px;
    font-weight: 700;
  }
</style>