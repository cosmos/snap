<script>
	import { getAddressBook } from "../store/addressbook";
	import { chains } from "../store/chains";
  import { state } from "../store/state";
	import { addAddressToBook } from "../utils/snap";
	import Button from "./Button.svelte";
	import ChainSelector from "./ChainSelector.svelte";

  let chain_id = $chains.length > 0 ? $chains[0].chain_id : "cosmoshub-4";
  let address = "cosmos163gulek3trdckcktcv820dpxntnm7qkkgfkcga";
  let name = "John Doe";
  let loading = false;
  export let open = false;

  const addAddress = async () => {
    try {
      loading = true;
      await addAddressToBook(chain_id, address, name);
      open = false;
      await getAddressBook();
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

<div hidden={!open} class="rectangle-66">
    <div class="group-4449">
        <div class="group-4448">
            <div class="group-4446">
                <div class="group-4444">
                    <div class="add-new-chain-1 inter-bold-white-20px">
                            Add address
                    </div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <img on:click={() => open = false} class="clear" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64ef9c2985c1bf1a9cb5beba/img/clear@2x.png" alt="clear">
                </div>
                    <img class="line-5 line" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64ef9c2985c1bf1a9cb5beba/img/line-5.png" alt="Line 5">
                </div>
                <div class="group-4447">
                    <div class="group-4445">
                        <div class="overlap-group">
                          <div class="percent inter-medium-white-14px">
                            Name
                          </div>
                          <input bind:value={name} type="text" placeholder="Enter address name" class="enter-amount inter-medium-white-14px overlap-group-7"/>
                          <div class="percent inter-medium-white-14px">
                            Address
                          </div>
                          <input bind:value={address} type="text" placeholder="Enter address" class="enter-amount inter-medium-white-14px overlap-group-7"/>
                          <div class="percent inter-medium-white-14px">
                            Chain
                          </div>
                          <ChainSelector bind:selectedChain={chain_id}/>
                        </div>
                    </div>
                <Button onClick={addAddress} text="Add address" bind:loading={loading}/>
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
  width: 100vw;
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

.clear {
  height: 24px;
  width: 24px;
  cursor: pointer;
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