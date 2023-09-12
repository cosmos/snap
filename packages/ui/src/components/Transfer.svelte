<script lang="ts">
  import { chains } from "../store/chains";
	import Info from "./Info.svelte";
	import { balances } from "../store/balances";
  import { getSkipRecommendation, getMsgs, type CoinIBC } from '../utils/ibc';
	import { state } from "../store/state";
	import type { Chain, Msg } from "@cosmsnap/snapper";
  import _ from 'lodash';
	import { getClient } from "../utils/tx";
	import { addTransaction } from "../store/transactions";
	import Button from "./Button.svelte";
	import ChainSelector from "./ChainSelector.svelte";
  import Select from "./Select.svelte";

  let loading = false;
  let source = "cosmoshub-4";
  let destination = "cosmoshub-4";
  let selected: CoinIBC = {amount: "0", denom: "uatom", ibc: false, display: "uatom".substring(1).toUpperCase()};
  let amount = 0;
  let noRoute = false;
  let recipient = "";
  let slippage = "1";
  let sourceBalances: CoinIBC[] = [];
  let feesAmount = 0.10;
  let gas = 0.025;
  let feesOpen = false;
  let fees = {
      amount: [
          {
              amount: feesAmount.toString(),
              denom: ""
          }
      ],
      gas: gas.toString(),
  };
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
    if (!selected) {
      selected = {amount: "0", denom: "uatom", ibc: false, display: "uatom".substring(1).toUpperCase()};
    }
    if (typeof amount != "number") {
      amount = 0
    }
    if (feesAmount) {
      fees = {
          amount: [
              {
                  amount: (feesAmount * 1000000).toString(),
                  denom: ""
              }
          ],
          gas: (gas * 1000000).toString(),
      }
    }
    let foundChain = $chains.find(item => item.chain_id === source);
    if (foundChain) {
      fromChain = foundChain;
      fees.amount[0].denom = fromChain.fees.fee_tokens[0].denom;
      gas = (fromChain.fees.fee_tokens[0].average_gas_price);
      
      if ($balances) {
        let source_chain = $balances.filter(item => item.chain_id == source)[0];
        if (source_chain) {
          sourceBalances = source_chain.balances;
          selected = sourceBalances[0];
        }
      }
    }
    fromAddress = fromChain.address
    console.log(fees);
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
            const coins = [
              {
                denom: selected.denom,
                amount: (amount * 1000000).toString(),  
              },
            ]
            const tx = await client.sendTokens(fromAddress, recipient, coins, fees);
            
            if (tx.code == 0) {
              await addTransaction({address: fromAddress, chain: source, when: new Date().toDateString(), tx_hash: tx.transactionHash})
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
          }

          const skipRec = await getSkipRecommendation(selected.denom, source, destination);

          if (!Array.isArray(skipRec.recommendations) || skipRec.recommendations.length === 0) {
              throw new Error("No recommended asset found.");
          }

          const firstRec = skipRec.recommendations[0].asset;
          if (!firstRec || !firstRec.denom) {
              throw new Error("Invalid recommendation data.");
          }

          const adjustedAmount = (amount * 1000000).toString();

          const msg = await getMsgs(source, selected.denom, destination, firstRec.denom, adjustedAmount, slippage, $chains, recipient);
          if (!Array.isArray(msg.msgs)) {
              throw new Error("Invalid message data.");
          }

          const messages: Msg[] = msg.msgs.map(item => {
              if (!item.msg || !item.msg_type_url) {
                  throw new Error("Invalid message format.");
              }

              const msgCamel = _.mapKeys(JSON.parse(item.msg), (value: any, key: any) => _.camelCase(key));

              return {
                  value: JSON.parse(JSON.stringify(msgCamel)),
                  typeUrl: item.msg_type_url
              };
          });
          let tx = await window.cosmos.signAndBroadcast(fromAddress, messages, fees);

          if (tx.code == 0) {
            await addTransaction({address: fromAddress, chain: source, when: new Date().toDateString(), tx_hash: tx.transactionHash})
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

      } catch (error: any) {
          loading = false;
          console.error(error);
          $state.alertType = "danger";
          $state.showAlert = true;
          $state.alertText = `${error.message}`;
      }
  };
</script>

<div class="overlap-group1">
    <div class="flex w-full justify-between items-center">
      <div class="ibc-transfer inter-medium-white-16px">
          {source == destination ? "Transfer" : "IBC Transfer"}
      </div>
      <svg on:click={() => feesOpen = !feesOpen} class="w-4 h-4 text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 1h4m0 0v4m0-4-5 5.243M5 15H1m0 0v-4m0 4 5.243-5"/>
      </svg>  
    </div>
    <div class="flex w-full items-start">
      <div class="percent inter-medium-white-14px">
          Source Chain
      </div>
    </div>
    <ChainSelector bind:selectedChain={source}/>
    <div style="width: 100%;">
        <div class="percent inter-medium-white-14px">
            Asset
        </div>
        <Select items={sourceBalances} bind:selectedItem={selected}/>
    </div>
    <input bind:value={amount} type="number" placeholder="Enter amount" class="enter-amount inter-medium-white-14px overlap-group-7"/>
    <div class="flex w-full items-end">
      <div class="percent inter-medium-white-14px">
          Destination Chain
      </div>
      <div class="hover:z-[500]">
          <Info/>
      </div>
    </div>
    <ChainSelector bind:selectedChain={destination}/>
    <div hidden={!noRoute} class="text-align-left w-full mt-4 inter-medium-red-14px">
        Route Not Found
    </div>
    <input bind:value={recipient} type="text" placeholder="Enter recipient address" class="enter-amount inter-medium-white-14px overlap-group-7"/>
    <div hidden={!feesOpen}>
      <div id="fees-container" class="flex">
        <div class="w-[50%] mr-2">
          <div class="percent inter-medium-white-14px">
            Gas
          </div>
          <div class="">
            <input bind:value={gas} type="number" placeholder="Enter amount" class="w-full enter-amount inter-medium-white-14px overlap-group-7"/>
          </div>
        </div>
        <div class="w-[50%] ml-2">
          <div class="percent inter-medium-white-14px">
            Fees
          </div>
          <div class="">
            <input bind:value={feesAmount} type="number" placeholder="Enter amount" class="w-full enter-amount inter-medium-white-14px overlap-group-7"/>
          </div>
        </div>
      </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => { amount = _.round((Number(selected.amount) / 1000000)) }} class="available-balance-1454789 inter-medium-blueberry-14px cursor-pointer">
        Available: {_.round((Number(selected.amount) / 1000000))} {selected.display}
    </div>
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
  color: var(--blueberry);
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