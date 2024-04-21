<script lang="ts">
  import { directory, type ChainDirectory } from "../store/directory";
  import { state } from "../store/state";
	import { createMultiSig } from "../utils/appwrite";
	import Button from "./Button.svelte";
  import _ from "lodash";
  import Select from "./Select.svelte";
  import type { SinglePubkey } from '@cosmjs/amino';
	import { onMount } from "svelte";
	import { getPubkeyFromNode } from "../utils/general";

  interface Member {
    pk: SinglePubkey;
    chain: ChainDirectory;
  }

  let threshold = 1;
  let memberCount = 2;
  let name = "My Multisig";
  let members: Member[] = [];
  let loading = false;
  let openMember = 0;

  onMount(() => {
    members = _.range(0, memberCount, 1).map(() => {
      return {
        pk: {
          type: "tendermint/PubKeySecp256k1",
          value: "",
        },
        chain: $directory[0],
      };
    });
  });

  const updateMemberChain = (index: number, chain: ChainDirectory) => {
    try {
      members[index].chain = chain;
    } catch (err) {
      console.error(err);
      loading = false;
      // @ts-ignore
      $state.alertText = err.message;
      $state.alertType = "danger";
      $state.showMenu = true;
    }
  }

  const updateMemberPk = async (index: number, address: string) => {
    try {
      const pk = await getPubkeyFromNode(address, members[index].chain);
      console.log(pk);
      members[index].pk = pk;
    } catch (err) {
      console.error(err);
      loading = false;
      // @ts-ignore
      $state.alertText = err.message;
      $state.alertType = "danger";
      $state.showMenu = true;
    }
  }

  const createMultisig = async () => {
    try {
      if (members.length != memberCount) {
        throw new Error(`Member count does not match. Received ${members.length}, expected ${memberCount}`);
      };
      loading = true;
      await createMultiSig(name, threshold, members.map(m => m.pk));
      $state.openAddMultisigPopup = !$state.openAddMultisigPopup
      loading = false;
    } catch (err) {
      console.error(err);
      loading = false;
      // @ts-ignore
      $state.alertText = err.message;
      $state.alertType = "danger";
      $state.showMenu = true;
    }
  }
</script>

<div class="rectangle-66">
    <div class="group-4449">
        <div class="group-4448">
            <div class="group-4446">
              <div class="group-4444">
                  <div class="add-new-chain-1 inter-bold-white-20px">
                    Create Multisig
                  </div>
                  <svg on:click={() => $state.openAddMultisigPopup = !$state.openAddMultisigPopup} class="w-6 h-6 text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                  </svg>  
              </div>
                  <img class="line-5 line" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64ef9c2985c1bf1a9cb5beba/img/line-5.png" alt="Line 5">
            </div>
            <div class="group-4447">
              <div class="group-4445">
                  <div class="overlap-group">
                    <div class="percent inter-medium-white-14px">
                      Multisig Name
                    </div>
                    <input bind:value={name} type="text" placeholder="Enter address name" class="enter-amount inter-medium-white-14px overlap-group-7"/>
                    <div class="percent inter-medium-white-14px">
                      Threshold
                    </div>
                    <input bind:value={threshold} type="number" placeholder="Enter threshold" class="enter-amount inter-medium-white-14px overlap-group-7"/>
                    <div class="percent inter-medium-white-14px">
                      Number of Members
                    </div>
                    <input bind:value={memberCount} type="number" placeholder="Enter member count" class="enter-amount inter-medium-white-14px overlap-group-7"/>
                  </div>
              </div>
              {#each _.range(0, memberCount, 1) as i}
                <div class="group-4445 mt-4" style={openMember == i ? `z-index: ${100};` : ""}>
                    <div class="overlap-group">
                      <div class="percent inter-medium-white-14px">
                        Chain
                      </div>
                      <Select on:change={(e) => updateMemberChain(i, e.detail ) } on:open={() => openMember = i} text="Select Chain" items={$directory} showKey="pretty_name" imageKey="image"/>
                      <div class="percent inter-medium-white-14px">
                        Address
                      </div>
                      <input on:change={(e) => updateMemberPk(i, e.currentTarget.value)} type="text" placeholder="Enter address" class="enter-amount inter-medium-white-14px overlap-group-7"/>
                    </div>
                </div>
              {/each}
              <Button onClick={createMultisig} text="Create multisig" bind:loading={loading}/>
            </div>
        </div>
    </div>
</div>

<style>
.rectangle-66 {
  z-index: 100;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: #05000bbf;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px;
}

.group-4449 {
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 20px;
  display: flex;
  height: 100%;
  width: 85%;
}

.group-4448 {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.group-4446 {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.group-4444 {
  align-items: flex-start;
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 25px;
}

.add-new-chain-1 {
  letter-spacing: -0.6px;
  line-height: normal;
  min-height: 24px;
  min-width: 137px;
  white-space: nowrap;
}

.inter-bold-white-20px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-xl);
  font-style: normal;
  font-weight: 700;
}

.line-5 {
  width: 100%;
}

.group-4447 {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 30px;
}

.group-4445 {
    align-items: center;
    display: flex;
    width: 100%;
    justify-content: center;
    height: 100%;
}

.overlap-group {
  align-items: flex-start;
  flex-direction: column;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 16px;
  display: flex;
  height: 100%;
  width: 100%;
  padding: 25px;
  font-family: var(--font-family-inter);
  color: var(--white);
  gap: 10px;
}

.overlap-group:focus {
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 16px;
  display: flex;
  height: 100%;
  width: 100%;
  padding: 25px;
  min-height: 330px;
  font-family: var(--font-family-inter);
  color: var(--white);
}

.overlap-group:focus-visible {
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 16px;
  display: flex;
  height: 100%;
  width: 100%;
  padding: 25px;
  min-height: 330px;
  font-family: var(--font-family-inter);
  color: var(--white);
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

.inter-medium-white-14px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}

.overlap-group-7 {
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  height: 41px;
  justify-content: flex-end;
  padding: 10px 17px;
  width: 100%;
  justify-content: space-between;
}

.percent {
  letter-spacing: -0.28px;
  line-height: normal;
  min-height: 17px;
  min-width: 46px;
  opacity: 0.45;
  text-align: left;
  width: 100%;
}

@media (min-width: 772px) {
  .group-4449 {
    max-width: 700px;
  }
}
</style>