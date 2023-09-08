<script lang="ts">
    import { goto } from "$app/navigation";
	import { state } from "../store/state";

    export let connected: boolean = true;
    export let logoSrc: string;
    export let logoText: string;
    export let connectWalletTxt: string;
</script>

{#if connected}
    <div class="navbar">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="logo-container" on:click={() => goto("/balances")}>
            <img class="logo-image" src={logoSrc} alt={logoText} />
            <div class="logo-text">{logoText}</div>
        </div>
        <div>
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <img on:click={() => $state.showMenu = !$state.showMenu} class="burger cursor-pointer" src="/mobile-menu-burger.png"/>
        </div>
    </div>
{:else}
    <div class="navbar">
        <div class="logo-container">
            <img class="logo-image" src={logoSrc} alt={logoText} />
            <div class="logo-text">{logoText}</div>
        </div>
        <div class="button-container">
            <button class="connect-button inter-medium-white-12px">
                {connectWalletTxt}
            </button>
        </div>
    </div>
{/if}

<style>
    .burger {
        height: 16.67px;
        width: 25px;
    }
    .navbar {
        position: fixed;
        backdrop-filter: blur(15px) brightness(100%);
        border: 1px solid;
        border-color: var(--white-2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 60px;
        width: 100%;
        z-index: 100;
        height: 75px;
    }

    .logo-container {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }

    .logo-image {
        height: 24px;
        width: 18px;
    }

    .logo-text {
        letter-spacing: 1.6px;
        line-height: normal;
        min-height: 19px;
        white-space: nowrap;
        color: var(--white);
        font-family: var(--font-family-inter);
        font-size: var(--font-size-l);
        font-style: normal;
        font-weight: 700;
    }

    .button-container {
        display: flex;
        align-items: center;
    }

    .connect-button {
        padding: 10px 20px;
        color: var(--white);
        background-color: var(--blueberry);
        border-radius: 10px;
        letter-spacing: -0.24px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        height: 40px;
        width: 130px;
    }

    .connect-button:hover {
        background-color: var(--blueberry);
        filter: brightness(1.1);
    }

    .inter-medium-white-12px {
        color: var(--white);
        font-family: var(--font-family-inter);
        font-size: var(--font-size-s);
        font-style: normal;
        font-weight: 500;
    }
</style>