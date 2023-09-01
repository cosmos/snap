<script>
  import AddAddress from "../../components/AddAddress.svelte";
	import { state } from "../../store/state";

  export let search_value = "";
</script>

<div class="w-full flex flex-col justify-center items-center h-full bg-[transparent]">
  <div hidden={!$state.openAddAddressPopup}>
    <AddAddress/>
  </div>
  <div class="rectangle-13">
    <div class="w-full flex justify-between mb-[20px]">
      <div class="chain-management">Address book</div>
      <button on:click={() => $state.openAddAddressPopup = true} class="connect-button button-text">
        Add address
      </button>
    </div>
    <input placeholder="Type a keyword" bind:value={search_value} class="search-input"/>    
    <div class="group-4407">
      <div class="group-45">
        <div class="group-45-1">
          <img
            class="mask-group"
            src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64e665d9e1c2a81b98b3cc49/img/mask-group@2x.png"
            alt="Mask group"
          />
          <div class="group-4405">
            <div class="name-2 name-3 inter-bold-white-16px">
              Johnny Bravo
            </div>
            <div class="group-4400">
              <div class="group-4537">
                <div class="cosmos1vhw82tqftrg inter-medium-white-12px">
                  cosmos1vhw8...2tqftrg
                </div>
                <img
                  class="content_copy"
                  src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64e66782179fd75deb1bab46/img/content-copy-12@2x.png"
                  alt="content_copy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
* {
  box-sizing: border-box;
}

.inter-medium-white-12px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s2);
  font-style: normal;
}

.inter-bold-white-16px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-l2);
  font-style: normal;
  font-weight: 700;
}

.group-4407 {
  display: grid;
  width: 100%;
  margin-top: 20px;
  justify-items: center;
}

.group-45 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  align-items: flex-end;
  backdrop-filter: blur(15px) brightness(100%);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  width: 100%;
  padding: 20px;
}

.group-45-1 {
  display: flex;
  gap: 15px;
  width: 204px;
  align-items: center;
}

.mask-group {
  height: 38px;
  margin-top: 1px;
  width: 38px;
}

.group-4405 {
  display: flex;
  flex-direction: column;
  width: 153px;
}

.group-4400 {
  display: flex;
  width: 151px;
}

.group-4537 {
  display: flex;
  gap: 10px;
  width: 153px;
  align-items: center;
}

.content_copy {
  height: 14px;
  margin-top: 1px;
  width: 14px;
}

.cosmos1vhw82tqftrg {
  line-height: normal;
}

.name-2 {
  width: 100%;
}

.rectangle-13 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
}

.chain-management {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
  text-align: center;
  align-self: center;
}

.connect-button {
  align-items: center;
  background-color: var(--blueberry);
  border-radius: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  overflow: hidden;
  padding: 13px 23px;
  height: 35px;
}

.connect-button:hover {
  background-color: var(--blueberry);
  filter: brightness(1.1);
}

.button-text {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s);
  font-style: normal;
  font-weight: 500;
}

.search-input {
  align-items: flex-end;
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  gap: 98px;
  width: 100%;
  padding: 10px 18px;
  font-family: var(--font-family-inter);
  color: white;
  height: 42px;
}

.search-input:focus-visible {
  align-items: flex-end;
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  gap: 98px;
  width: 100%;
  padding: 10px 18px;
  font-family: var(--font-family-inter);
  color: white;
}

input:active {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.10);
  border-radius: 8px;
}

input:focus {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.10);
  border-radius: 8px;
}

input:focus-visible {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.10);
  border-radius: 8px;
}
</style>