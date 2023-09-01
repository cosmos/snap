<script>
    export let data = { '#': 1, address: "osmo1vhw8...2tqftrg", chain: "Osmosis", tx_hash: 8746613, when: "21 Apr 07:15:58" }
</script>

<div class="group-4514">
    <div class="group-4511">
        <div class="group-4508">
            <div class="address inter-medium-white-12px">
                Address
            </div>
            <div class="frame-33 frame">
                <div class="data inter-medium-white-12px">
                    {data.address}
                </div>
                <img class="content_copy" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64e66782179fd75deb1bab46/img/content-copy-12@2x.png" alt="content_copy">
            </div>
        </div>
        <div class="group-4508">
            <div class="address inter-medium-white-12px">
                Chain
            </div>
            <div class="frame-42 frame">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img class="image" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64a70f4223abf7e924bfd349/img/image-4@2x.png" alt="image 4">
                <div class="osmosis inter-medium-white-12px">
                    {data.chain}
                </div>
            </div>
        </div>
    </div>
    <div class="group-4511">
        <div class="group-4508">
            <div class="address inter-medium-white-12px">
                Transaction ID
            </div>
            <div class="address-1 inter-medium-white-12px">
                {data.tx_hash}
            </div>
        </div>
        <div class="group-4508">
            <div class="address inter-medium-white-12px">
                When
            </div>
            <div class="address-1 inter-medium-white-12px">
                {data.when}
            </div>
        </div>
    </div>
</div>

<style>
.group-4514 {
  align-items: flex-start;
  backdrop-filter: blur(15px) brightness(100%);
  background-color: var(--licorice);
  border: 1px solid;
  border-color: var(--white-2);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 130px;
  padding: 15px 20px;
  width: 100%;
}

.group-4511 {
  display: flex;
  gap: 49px;
  width: 100%;
}

.group-4508 {
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 37px;
  width: 100%;
}

.address {
  height: 16px;
  letter-spacing: -0.36px;
  line-height: 16px;
  opacity: 0.35;
  white-space: nowrap;
  width: 100%;
}

.inter-medium-white-12px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s2);
  font-style: normal;
  font-weight: 500;
}

.frame-33 {
  gap: 5px;
  height: 16px;
  width: 144px;
}

.frame {
  align-items: center;
  display: inline-flex;
}

.data {
  letter-spacing: -0.36px;
  line-height: 16px;
  margin-top: -1px;
  white-space: nowrap;
  width: fit-content;
}

.content_copy {
  height: 14px;
  width: 14px;
}

.frame-42 {
  gap: 5px;
  height: 20px;
  width: 100%;
}

.image {
  height: 20px;
  object-fit: cover;
  width: 20px;
}

.osmosis {
  letter-spacing: -0.36px;
  line-height: 16px;
  white-space: nowrap;
  width: fit-content;
}

.address-1 {
  height: 16px;
  letter-spacing: -0.36px;
  line-height: 16px;
  white-space: nowrap;
  width: 100%;
}
</style>