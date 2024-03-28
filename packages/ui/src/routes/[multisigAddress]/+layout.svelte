<script lang="ts">
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { onMount } from 'svelte';

let { multisigAddress } = $page.params;

onMount(() => {
    console.log($page.params.multisigAddress);
    if (!multisigAddress) {
        goto('/');
    }
})
</script>

<slot/>

<style>
</style>