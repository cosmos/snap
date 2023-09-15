<script lang="ts">
    export let title: string;
    export let subtitle: string;
</script>

<h1 class="connect-cosmos-to-metamask">
    <span class="inter-extra-bold-white-56px">{title} </span>
    <span class="span1">{subtitle}<br /></span>
    <span class="inter-extra-bold-white-56px">into Metamask</span>
</h1>

<style>
    :root {
        --white: #ffffff;
        --blueberry: #594bff;
        --font-size-xxl: 56px;
        --font-family-inter: "Inter", Helvetica;
    }

    .connect-cosmos-to-metamask {
        margin-top: 120px;
        color: transparent;
        font-family: var(--font-family-inter);
        font-size: var(--font-size-xxl);
        font-weight: 800;
        letter-spacing: -1.68px;
        line-height: normal;
        margin-bottom: 60px;
        min-height: 136px;
        text-align: center;
    }

    .span1 {
        color: var(--blueberry);
    }

    .inter-extra-bold-white-56px {
        color: var(--white);
        font-family: var(--font-family-inter);
        font-size: var(--font-size-xxl);
        font-style: normal;
        font-weight: 800;
    }
</style>