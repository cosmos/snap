<script>
  export let name = "Osmosis";
  export let dollarAmount = 16.75;
  export let tokenAmount = 48.77;
  export let tokenDenom = "osmo";
  export let chainAddress = "osmo1m9l358xunhdhqp0568dj37mzhvuxx9uxtz4vt7";
  export let logo = "https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/mask-group-18@2x.png";
</script>

<div class="group-55">
  <div class="group-51">
      <div class="group-28">
          <div class="group-46">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src={logo}/>
          </div>
      </div>
      <div class="group-49">
          <div class="chain inter-bold-white-22px">
              {name}
          </div>
      <div class="group-53">
          <div class="price inter-medium-white-12px">
            ${dollarAmount}
          </div>
          <div class="percent inter-medium-white-14px">
            {tokenAmount} {tokenDenom.toUpperCase()}
          </div>
      </div>
  </div>
</div>
<div class="frame-33 frame-2">
  <div class="cosmos1vhw82tqftrg-1 inter-medium-white-14px">
      {chainAddress}
  </div> 
  <img class="content_copy-1" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70dda287bc6479f0ac9fd/img/content-copy-1.svg" alt="content_copy">
</div>
</div>

<style>
.group-55 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 17px;
  left: 264px;
  min-height: 110px;
  padding: 20px 17px;
  top: 405px;
  width: 100%;
}

.group-51 {
  align-items: center;
  display: flex;
  gap: 15px;
  width: 100%;
}

.group-28 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 24px;
  display: flex;
  height: 48px;
  min-width: 48px;
  padding: 2.1px 2.1px;
  align-items: center;
  justify-content: center;
}

.group-46 {
  -webkit-backdrop-filter: blur(15px) brightness(100%);
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--eerie-black);
  background-size: 100% 100%;
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 19.9px;
  height: 40px;
  width: 40px;
}

.chain {
  letter-spacing: -0.6px;
  line-height: normal;
  min-height: 24px;
  white-space: nowrap;
}

.inter-bold-white-22px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
}

.group-53 {
  display: grid;
  height: 17px;
  width: 100%;
  grid-auto-flow: column;
  margin-top: 5px;
}

.price {
  letter-spacing: -0.36px;
  line-height: 16px;
  min-width: 39px;
  white-space: nowrap;
}

.inter-medium-white-12px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
  opacity: 0.45;
}

.percent {
  letter-spacing: -0.28px;
  line-height: normal;
  min-height: 17px;
  min-width: 46px;
  opacity: 0.45;
  text-align: right;
}

.inter-medium-white-14px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}

.group-49 {
  width: 100%;
}

.frame-33 {
  align-items: center;
  cursor: pointer;
}

.frame-2 {
  display: flex;
  width: inherit;
  justify-content: space-between;
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 14px;
  padding: 13px;
  background-color: var(--licorice);
}

.cosmos1vhw82tqftrg-1 {
  letter-spacing: -0.48px;
  line-height: 16px;
  white-space: nowrap;
  width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inter-medium-white-14px {
  color: white;
  font-family: var(--font-family-inter);
  font-size: var(--font-size-m);
  font-style: normal;
  font-weight: 500;
}

.content_copy-1 {
  height: 18px;
  min-width: 18px;
  margin-left: 15px;
}
</style>