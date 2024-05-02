<script lang="ts">
  import { chains } from "../store/chains";
	import Info from "./Info.svelte";
	import { balances, forceUpdate } from "../store/balances";
  import { getSkipRecommendation, getMsgs, type CoinIBC } from '../utils/skip';
	import { state } from "../store/state";
	import type { Chain, Msg } from "../../../snapper/src/index";
  import _ from 'lodash';
	import { getClient } from "../utils/tx";
	import { addTransaction } from "../store/transactions";
	import Button from "./Button.svelte";
  import { sendTxAlert } from "../../../snapper/src/index";
  import Select from "./Select.svelte";
	import { snapId } from "../utils/snap";
	import { onMount } from "svelte";
	import { coins } from "@cosmjs/stargate";
  import { toBase64 }from "@cosmjs/encoding";
  import type { MultisigThresholdPubkey } from '@cosmjs/amino';
  
  let loading = false;
  let source: Chain | undefined;
  let destination: Chain | undefined;
  let selected: any;
  let sourceChainChange = false;
  let amount = 0;
  let noRoute = false;
  let recipient = "";
  let slippage = "1";
  let sourceBalances: CoinIBC[] = [];
  let fromAddress: string | undefined = "";
  let fromChain: Chain = {
	  chain_name: "",
	  chain_id: "",
	  pretty_name: "",
	  slip44: 0,
	  bech32_prefix: "",
	  fees: {fee_tokens: []},
	  apis: {
		  rpc: [],
		  rest: [],
		  grpc: undefined
	  },
	  address: undefined
  };

  $: {
    if (source) {
      fromChain = source;
      
      if ($balances) {
        let source_chain = $balances.filter(item => item.chain_id == source?.chain_id)[0];
        if (source_chain) {
          sourceBalances = source_chain.balances;
          if(sourceChainChange) {
            selected = sourceBalances[0];
            sourceChainChange = false;
          }
        }
      }
    }
    fromAddress = fromChain.address;
    if (!selected) {
      selected = {amount: "0", denom: "uatom", ibc: false, display: "uatom".substring(1).toUpperCase()}; 
    }
  }

  const computeIBCRoute = async () => {
      loading = true;
      noRoute = false;

      try {
          const client = await getClient(fromChain);
          if (fromAddress == undefined) {
            throw new Error(`Address not found for ${fromChain.pretty_name}`)
          }

          if (source === destination) {
            const sendAmt = [
              {
                denom: selected.denom,
                amount: (amount * 1000000).toString(),  
              },
            ]
            const account = await window.cosmos.getAccount(fromChain.chain_id);
            let msg = {
              typeUrl: "/cosmos.bank.v1beta1.MsgSend",
              value: {
                fromAddress,
                toAddress: recipient, 
                amount: sendAmt
              }
            }
            // We replace the address with the signing address here because the simulation requires the address to be the signer since we do not have all multisig signers
            const replaced = JSON.parse(JSON.stringify([msg]).replace(fromAddress, account.address));
            // Simulate the transaction
            const gasEstimation = await client.simulate(account.address, replaced, "");

            // Calculate the fee using 1.4 multiplier to be safe
            const fee = {
                amount: coins((_.round(gasEstimation*1.4, 0)).toString(), source!.fees.fee_tokens[0].denom),
                gas: (_.round(gasEstimation*1.4, 0)).toString(),
            };
            const sig = await client.sign(account.address, [msg], fee, "");
            const base64Signature = toBase64(sig.signatures[0]);
            const base64BodyBytes = toBase64(sig.bodyBytes);
            const ms: MultisigThresholdPubkey = JSON.parse($state.currentMultiSig.public_key);
            const tx = await window.cosmos.createMultisigTx(ms, fromChain.apis.rpc[0].address, fromChain.bech32_prefix, base64Signature, base64BodyBytes, JSON.stringify([msg]), fromChain.chain_id, fromAddress, fee);
            
            if (tx.code == 0) {
              await addTransaction({address: fromAddress, chain: source!.chain_id, when: new Date().toLocaleString(), tx_hash: tx.transactionHash});
              await sendTxAlert(source!.chain_id, tx.transactionHash, snapId);
              forceUpdate();
            } else {
              if (tx.rawLog) {
                $state.alertText = tx.rawLog
              } else {
                $state.alertText = "There was an issue while submitting your transaction."
              }
              $state.alertType = "danger"
              $state.showAlert = true
            }

            loading = false;

            return tx
          }

          const skipRec = await getSkipRecommendation(selected.denom, source!.chain_id, destination!.chain_id);

          if (!Array.isArray(skipRec.recommendations) || skipRec.recommendations.length === 0) {
              throw new Error("No recommended asset found.");
          }

          const firstRec = skipRec.recommendations[0].asset;
          if (!firstRec || !firstRec.denom) {
              throw new Error("Invalid recommendation data.");
          }

          const adjustedAmount = (amount * 1000000).toString();

          const msg = await getMsgs(source!.chain_id, selected.denom, destination!.chain_id, firstRec.denom, adjustedAmount, slippage, $chains, recipient);
          if (!('msgs' in msg)) {
              throw new Error("No routes found.");
          }

          const messages: Msg[] = msg.msgs.map(item => {
              if (!item.multi_chain_msg.msg || !item.multi_chain_msg.msg_type_url) {
                  throw new Error("Invalid message format.");
              }

              const msgCamel = _.mapKeys(JSON.parse(item.multi_chain_msg.msg), (value: any, key: any) => _.camelCase(key));

              return {
                  value: JSON.parse(JSON.stringify(msgCamel)),
                  typeUrl: item.multi_chain_msg.msg_type_url
              };
          });
          // Simulate the transaction
          const account = await window.cosmos.getAccount(fromChain.chain_id);
          // We replace the address with the signing address here because the simulation requires the address to be the signer since we do not have all multisig signers
          const replaced = JSON.parse(JSON.stringify(messages).replace(fromAddress, account.address));
          const gasEstimation = await client.simulate(account.address, replaced, "");

          // Calculate the fee using 1.4 multiplier to be safe
          const fee = {
              amount: coins((_.round(gasEstimation*1.4, 0)).toString(), source!.fees.fee_tokens[0].denom),
              gas: (_.round(gasEstimation*1.4, 0)).toString(),
          };
          const sig = await client.sign(account.address, messages, fee, "");
          const base64Signature = toBase64(sig.signatures[0]);
          const base64BodyBytes = toBase64(sig.bodyBytes);
          const ms: MultisigThresholdPubkey = JSON.parse($state.currentMultiSig.public_key);
          const tx = await window.cosmos.createMultisigTx(ms, fromChain.apis.rpc[0].address, fromChain.bech32_prefix, base64Signature, base64BodyBytes, JSON.stringify(messages), fromChain.chain_id, fromAddress, fee);

          if (tx.code == 0) {
            await addTransaction({address: fromAddress, chain: source!.chain_id, when: new Date().toLocaleString(), tx_hash: tx.transactionHash});
            await sendTxAlert(source!.chain_id, tx.transactionHash, snapId);
            forceUpdate();
          } else {
            if (tx.rawLog) {
              $state.alertText = tx.rawLog
            } else {
              $state.alertText = "There was an issue while submitting your transaction. View explorer for more details."
            }
            $state.alertType = "danger"
            $state.showAlert = true
          }

          loading = false;

          return tx

      } catch (error: any) {
          loading = false;
          console.error(error);
          $state.alertType = "danger";
          $state.showAlert = true;
          $state.alertText = `${error.message}`;
      }
  };
  onMount(() => {
    source = $chains.find(item => item.chain_id === "cosmoshub-4");
    if (source == undefined) {
      source = $chains[0];
    }
    destination = $chains.find(item => item.chain_id === "cosmoshub-4");
    if (destination == undefined) {
      destination = $chains[0];
    }
  })
</script>

<div class="overlap-group1">
    <div class="flex w-full justify-between items-center">
      <div class="ibc-transfer inter-medium-white-16px">
          {source == destination ? "Transfer" : "IBC Transfer"}
      </div>
    </div>
    <div class="flex w-full items-start">
      <div class="percent inter-medium-white-14px">
          Source Chain
      </div>
    </div>
    <Select on:change={() => sourceChainChange = true} text="Select Chain" items={$chains} bind:selectedItem={source} showKey="pretty_name" imageKey="logo_URIs" nestedImageKey="png"/>
    <div style="width: 100%;">
        <div class="percent inter-medium-white-14px">
            Asset
        </div>
        <Select items={sourceBalances} bind:selectedItem={selected}/>
    </div>
    <input bind:value={amount} type="number" placeholder="Enter amount" class="enter-amount inter-medium-white-14px overlap-group-7"/>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => { amount = _.round((Number(selected.amount) / 1000000), 2) }} class="available-balance-1454789 inter-medium-blueberry-14px cursor-pointer">
        Available: {_.round((Number(selected.amount) / 1000000), 2)} {selected.display}
    </div>
    <div class="flex w-full items-end">
      <div class="percent inter-medium-white-14px">
          Destination Chain
      </div>
      <div class="">
          <Info/>
      </div>
    </div>
    <Select text="Select Chain" items={$chains} bind:selectedItem={destination} showKey="pretty_name" imageKey="logo_URIs" nestedImageKey="png"/>
    <div hidden={!noRoute} class="text-align-left w-full mt-4 inter-medium-red-14px">
        Route Not Found
    </div>
    <input bind:value={recipient} type="text" placeholder="Enter recipient address" class="enter-amount inter-medium-white-14px overlap-group-7"/>
    <Button onClick={computeIBCRoute} bind:loading={loading}/>
</div>

<style>
.overlap-group1 {
  align-items: center;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  min-height: 406px;
  padding: 23px 20px;
  width: 100%;
}

.ibc-transfer {
  align-self: flex-start;
  letter-spacing: -0.48px;
  line-height: 16px;
  margin-left: 2px;
  white-space: nowrap;
}

.inter-medium-white-16px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-l);
  font-style: normal;
  font-weight: 500;
}

.inter-medium-white-14px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}

.overlap-group-7 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  gap: 118px;
  height: 41px;
  justify-content: flex-end;
  margin-left: 1px;
  margin-top: 15px;
  min-width: 272px;
  padding: 10px 17px;
  width: 100%;
  justify-content: space-between;
}

.enter-amount {
  letter-spacing: -0.28px;
  line-height: normal;
  min-height: 17px;
  min-width: 87px;
  color: white;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
}

.inter-medium-blueberry-14px {
  color: white;
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}

.inter-medium-red-14px {
  color: red;
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}

.available-balance-1454789 {
  align-self: flex-end;
  letter-spacing: -0.28px;
  line-height: normal;
  margin-right: 1px;
  margin-top: 10px;
  min-height: 17px;
  min-width: 180px;
  text-align: right;
}

.inter-medium-white-14px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}

.percent {
  letter-spacing: -0.28px;
  line-height: normal;
  min-height: 17px;
  min-width: 46px;
  opacity: 0.45;
  text-align: left;
  width: fit-content;
  margin-top: 20px;
  display: flex;
}
</style>