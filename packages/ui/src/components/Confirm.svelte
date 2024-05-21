<script>
	import Button from "./Button.svelte";

    export let show = false;
    export let text = "Delete the transaction?"
    export let yesButtonText = "Yes, I'm sure"
    export let noButtonText = "No, cancel"
    export let onYesClick = () => {};
    export let onNoClick = () => {};
    export let onClose = () => {};
</script>

{#if show}
<div class="rectangle-66">
    <div class="group-4449">
        <div class="group-4448">
            <div class="group-4446">
                <div class="group-4444">
                    <div class="inter-bold-white-20px w-1/2 items-center">
                        {text}
                    </div>
                    <div class="w-1/2 flex justify-end items-center">
                        <svg on:click={onClose} class="w-6 h-6 text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>   
                    </div>                   
                </div>
                <img class="line-5 line" src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64ef9c2985c1bf1a9cb5beba/img/line-5.png" alt="Line 5">
                </div>
                <div class="group-4447">
                    <div class="group-4445">
                </div>
                <div class="w-full flex">
                    <div class="w-1/2 mr-5">
                        <Button onClick={onYesClick} text={yesButtonText}/>
                    </div>
                    <div class="w-1/2 ml-5">
                        <Button onClick={onNoClick} text={noButtonText}/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
  .rectangle-66 {
      z-index: 100;
      backdrop-filter: blur(15px) brightness(100%);
      background-color: #05000bbf;
      left: 0;
      position: fixed;
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
    display: flex;
    width: 100%;
    padding: 25px;
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
</style>