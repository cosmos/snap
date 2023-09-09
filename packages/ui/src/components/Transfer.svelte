<script lang="ts">
  import { chains } from "../store/chains";
	import Info from "./Info.svelte";
	import { balances } from "../store/balances";
	import { SigningStargateClient, type Coin } from "@cosmjs/stargate";
  import { getSkipRecommendation, getRoute, type Route } from '../utils/ibc';
	import { state } from "../store/state";
  import { CosmosSnap } from "@cosmsnap/snapper";

  let source = "cosmoshub-4";
  let destination = "cosmoshub-4";
  let denom = "uatom";
  let available: Coin = {amount: "0", denom};
  let amount = 0;
  let noRoute = false;

  const test = async () => {
    window.cosmos.changeSnapId("local:http://localhost:8080")

    // Message info
    const memo = "My CosmJS Protobuf Message";
    const chainId = "cosmoshub-4";

    let offlineSigner = await window.cosmos.getOfflineSigner("cosmoshub-4");

    let wallet = await window.cosmos.getAccount("cosmoshub-4");
    console.log(wallet);

    // Create a send tokens message
    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: wallet.address,
        toAddress: "cosmos123456789",
        amount: [
          {
            denom: "uatom",
            amount: "10000",
          },
        ],
      },
    };

    // Create fee and sign doc
    const fee = {
      amount: [],
      gas: "200000",
    };

    const signingClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-cosmoshub.whispernode.com:443",
      offlineSigner
    );

    const result = await signingClient.sign(wallet.address, [msg], fee, memo);

    console.log(result);
  }

  const computeIBCRoute = async () => {
    if (source != destination) {
      try {
        let skipRec = await getSkipRecommendation(denom, source, destination);
        if (skipRec.recommendations.length == 0) {
          noRoute = true;
          throw new Error("No recommended asset found.");
        }
        let routeSkip = await getRoute(amount.toString(), denom, source, skipRec.recommendations[0].asset.denom, destination);
        if (!routeSkip) {
          noRoute = true;
          throw new Error("No route found.");
        }
        console.log(routeSkip);
      } catch (error: any) {
        noRoute = true;
        $state.alertType = "danger";
        $state.showAlert = true;
        $state.alertText = `Error Occured Finding Route: ${error.message}`
      }
    }
  }

  $: {
      let filtBal = $balances.filter(item => item.chain_id == source);
      if (filtBal.length > 0) {
        let filtTokens = filtBal[0].balances.filter(item => item.denom == denom);
        if (filtTokens.length > 0) {
          available = filtTokens[0]
        } else {
          available = { amount: "0", denom };
        }
      } else {
        available = { amount: "0", denom };
      }
  }
</script>

<div class="overlap-group1">
    <div class="ibc-transfer inter-medium-white-16px">
        {source == destination ? "Transfer" : "IBC Transfer"}
    </div>
    <div class="flex w-full items-start">
      <div class="percent inter-medium-white-14px">
          Source Chain
      </div>
    </div>
    <select bind:value={source} id="source_chain" name="source_chain" class="group-32-1 source-chain-osmosis inter-medium-white-14px">
      {#each $chains as chain}
        <option class="source-chain-osmosis inter-medium-white-14px" value={chain.chain_id}>{chain.pretty_name}</option>
      {/each}
    </select>
    <div style="width: 100%;">
        <div class="percent inter-medium-white-14px">
            Asset
        </div>
        <select bind:value={denom} id="denom" name="denom" class="group-32-1 source-chain-osmosis inter-medium-white-14px">
            <option class="source-chain-osmosis inter-medium-white-14px" value="uosmo">OSMO</option>
            <option class="source-chain-osmosis inter-medium-white-14px" value="uatom">ATOM</option>
        </select>
    </div>
    <input type="number" placeholder="Enter amount" class="enter-amount inter-medium-white-14px overlap-group-7"/>
    <div class="flex w-full items-end">
      <div class="percent inter-medium-white-14px">
          Destination Chain
      </div>
      <div class="z-index-[1000]">
          <Info/>
      </div>
    </div>
    <select bind:value={destination} id="dest_chain" name="dest_chain" class="group-32-1 source-chain-osmosis inter-medium-white-14px">
      {#each $chains as chain}
        <option class="source-chain-osmosis inter-medium-white-14px" value={chain.chain_id}>{chain.pretty_name}</option>
      {/each}
    </select>
    <div hidden={!noRoute} class="text-align-left w-full mt-4 inter-medium-red-14px">
        Route Not Found
    </div>
    <input bind:value={amount} type="text" placeholder="Enter recipient address" class="enter-amount inter-medium-white-14px overlap-group-7"/>
    <div class="available-balance-1454789 inter-medium-blueberry-14px">
        Available: {Math.round((Number(available.amount) / 1000000) * 100) / 100} {available.denom.substring(1).toUpperCase()}
    </div>
    <button on:click={test} class="frame-1-2 frame-1-4 button-send">
        <div class="send-amount-1 inter-medium-white-12px">
            Send amount
        </div>
    </button>
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

.group-32-1 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  align-items: center;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  height: 41px;
  margin-left: 1px;
  margin-top: 15px;
  min-width: 272px;
  padding: 4px 5px;
  width: 100%;
}

.source-chain-osmosis {
  letter-spacing: -0.28px;
  line-height: normal;
  min-height: 17px;
  min-width: 147px;
  width: 100%;
  padding-left: 10px;
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

.frame-1-2 {
  margin-left: 1px;
  margin-top: 35px;
  width: 272px;
}

.frame-1-4 {
  align-items: center;
  background-color: var(--blueberry);
  border-radius: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  overflow: hidden;
  padding: 13px 23px;
  width: 100%;
}

.send-amount-1 {
  letter-spacing: -0.24px;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  width: fit-content;
}

.inter-medium-white-12px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s);
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

.button-send {
  letter-spacing: -0.36px;
  line-height: normal;
  margin-top: 15px;
  position: relative;
  width: fit-content;
  height: 40px;
  min-width: 100px;
  width: 100%;
}

.button-send:hover {
  background-color: var(--blueberry);
  filter: brightness(1.1);
}

select {
  border-radius: 5px;
  padding: 10px;
}

option {
  font-size: 16px;
  padding: 10px;
  background-color: #141414;
  border-radius: 5px;
  border: 1px;
}
</style>