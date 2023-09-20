<script lang="ts">
	import MainTitle from '../components/MainTitle.svelte';
	import Step from '../components/Step.svelte';
	import { initSnap, installSnap, isMetaMaskInstalled, isSnapLatestVersion, snapId } from '../utils/snap';
	import { state } from '../store/state';
	import { goto } from '$app/navigation';
	import { LOCAL_STORAGE_CHAINS } from '../utils/general';
	import { chains } from '../store/chains';
	import { isSnapInitialized, isSnapInstalled } from '@cosmsnap/snapper';
	import { onMount } from 'svelte';

	const initializeData = async () => {
    try {
      $state.loading = true;
      $state.isMetaMaskInstalledValue = isMetaMaskInstalled() ?? false;
      $state.loading = false;
      if ($state.isMetaMaskInstalledValue) {
        $state.loading = true;
        $state.isSnapInstalledValue = await isSnapInstalled(snapId);
        $state.isSnapLatestVersion = await isSnapLatestVersion();
        $state.loading = false;
      }
      if ($state.isSnapInstalledValue) {
        $state.loading = true;
        $state.isSnapInitValue = await isSnapInitialized(snapId);
        $state.loading = false;
      }
      if ($state.isMetaMaskInstalledValue && $state.isSnapInstalledValue && $state.isSnapInitValue && $state.isSnapLatestVersion ) {
        $state.connected = true;
      }
     } catch (err: any) {
      $state.loading = false;
      $state.alertText = `${err.message}`
      $state.alertType = "danger"
      $state.showAlert = true
    }
	};

	const runInstallSnap = async () => {
    try {
      $state.loading = true;
      await installSnap();
      await initializeData();
      $state.isSnapInstalledValue = true;
      $state.isSnapInitValue = false;
      $state.loading = false;
    } catch (err: any) {
      $state.loading = false;
      $state.alertText = `${err.message}`
      $state.alertType = "danger"
      $state.showAlert = true
    }
	};

	const initializeSnap = async () => {
    $state.loading = true;
    try {
      const chainsFromInit = await initSnap();
      localStorage.setItem(LOCAL_STORAGE_CHAINS, JSON.stringify(chainsFromInit));
      chains.set(chainsFromInit);
      $state.isSnapInitValue = true;
      $state.connected = true;
      $state.alertText = `Generating keys. This may take a minute.`
      $state.alertType = "warning"
      $state.showAlert = true
      $state.loading = false;
    } catch (err: any) {
      $state.loading = false;
      if (err.message == "The Cosmos Snap has already been initialized.") {
        $state.isSnapInitValue = true;
        $state.connected = true;
        goto("/balances")
      } else {
        $state.alertText = `${err.message}`
        $state.alertType = "danger"
        $state.showAlert = true
      }
    }
	};

  onMount(initializeData);
</script>

<div class="x1-connect-metamask screen">
    <div class="overlap-group3">      
        <div class="group-25">
            <MainTitle title="Add" subtitle="Cosmos" />
            <div class="how-to-connect">HOW TO CONNECT</div>
            <div>
              <div class="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-3 mb-8 group-24">
                  <Step
                      bind:loading={$state.loading}
                      disabled = {$state.isMetaMaskInstalledValue}
                      action={() => { window.open('https://metamask.io/download', '_blank') }}
                      complete={$state.isMetaMaskInstalledValue}
                      stepNumber="1"
                      stepTitle="Install Metamask"
                      stepImage="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/metamask-1.svg"
                      actionText="Install Metamask"
                      stepDescription = "Add Metamask to your browser."
                      stepLongTitle = "Install Metamask"
                      stepLongDescription = "Download and install the Metamask extension in your browser."
                  />

                  {#if $state.isSnapInstalledValue && !$state.isSnapLatestVersion}
                    <Step
                        bind:loading={$state.loading}
                        disabled={$state.isMetaMaskInstalledValue && $state.isSnapInstalledValue && $state.isSnapLatestVersion}
                        action={() => { window.location.href = "https://snaps.metamask.io/snap/npm/cosmsnap/snap/"; }}
                        complete={$state.isSnapInstalledValue && $state.isSnapLatestVersion}
                        stepNumber="2"
                        stepTitle="Upgrade Cosmos Snap"
                        stepImage="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/image-3@2x.png"
                        actionText="Upgrade Snap"
                        stepDescription="Login to Metamask and upgrade the Cosmos Snap." 
                        stepLongTitle="Upgrade Cosmos Snap"
                        stepLongDescription={"Please upgrade to the latest Cosmos MetaMask Snap."}
                    />
                  {:else}
                    <Step
                        bind:loading={$state.loading}
                        disabled={$state.isMetaMaskInstalledValue && $state.isSnapInstalledValue}
                        action={runInstallSnap}
                        complete={$state.isSnapInstalledValue}
                        stepNumber="2"
                        stepTitle={"Install Cosmos Snap"}
                        stepImage="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/image-3@2x.png"
                        actionText={"Install Snap"}
                        stepDescription = "Login to Metamask and install the Cosmos Snap."
                        stepLongTitle = {"Install Cosmos Snap"}
                        stepLongDescription = "Install the official Cosmos Metamask Snap into Metamask."
                    />
                  {/if}

                  <Step 
                      bind:loading={$state.loading}
                      disabled={!$state.isMetaMaskInstalledValue || !$state.isSnapInstalledValue || $state.isSnapInitValue}
                      action={async () => { await initializeSnap(); }}
                      complete={$state.isSnapInitValue}
                      stepNumber="3"
                      stepTitle="Initiate Cosmos Snap"
                      stepImage="/cosmos-atom-logo.png"
                      actionText="Initialize Cosmos"
                      stepDescription = "Initialize the Cosmos Snap with initial chains."
                      stepLongTitle = " Initiate Cosmos Snap"
                      stepLongDescription = "Initialize all default chains from the Cosmos chain registry."
                  />
              </div>
            </div>
        </div>
    </div>
</div>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css");

@import url("https://fonts.googleapis.com/css?family=Inter:500,700,800,400");

* {
  box-sizing: border-box;
}

.x1-connect-metamask {
  align-items: flex-start;
  background-color: #05000b;
  border: 1px none;
  overflow: hidden;
  max-width: var(--responsive-width); /* Use max-width instead of width for responsiveness */
  width: 100%; /* Takes the full width available */
}

.overlap-group3 {
  background-image: url(https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/rectangle-8.svg);
  background-size: cover; /* Changed to cover to ensure responsiveness of background */
  background-position: center;
  min-height: 100vh;
  position: relative;
  max-width: var(--responsive-width);
  width: 100%;
}

.group-25 {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: var(--responsive-group-left);
  min-height: 643px;
  top: var(--responsive-group-top);
  width: 100%;
}

.group-24 {
  align-items: center;
  gap: 30px;
  min-height: 447px;
  width: 100%; /* Adjusted for responsiveness */
}

.how-to-connect {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-m);
    font-weight: 700;
    letter-spacing: 2.1px;
    line-height: normal;
    margin-top: 20px;
    min-height: 17px;
    min-width: 160px;
    text-align: center;
    margin-bottom: 20px;
}

/* Responsive Styles */
@media (max-width: 1200px) { 
  :root {
    --responsive-width: 100%;
    --responsive-gap: 2px;
    --responsive-group-left: 5%;
    --responsive-group-top: 80px;
  }
}

@media (max-width: 820px) {
  :root {
    --responsive-gap: 1px;
    --responsive-group-left: 2%;
    --responsive-group-top: 50px;
  }

  .how-to-connect {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-m);
    font-weight: 700;
    letter-spacing: 2.1px;
    line-height: normal;
    margin-right: 2px;
    min-height: 17px;
    min-width: 160px;
    text-align: center;
  }
}
</style>