<script>
    import { Popover } from 'flowbite-svelte';
    import { QuestionCircleSolid, ChevronRightOutline } from 'flowbite-svelte-icons';

    export let image = "/skip-dark-logo.png";
    export let header = "Powered by the Skip API";
    export let firstPara = "Select a different chain to transfer your asset to & witness the power of Inter-Blockchain Communication (IBC).";
    export let secondPara = "Keep the Source and Destination the same to send on the same chain.";
    export let buttonText = "Learn more";
    export let buttonUrl = "https://skip.money/docs";
</script>

<div class="flex items-center text-sm font-light text-gray-500 dark:text-gray-400">
<button id="b3">
    <QuestionCircleSolid class="w-4 h-4 ml-1.5" />
    <span class="sr-only">Show information</span>
</button>
</div>
<Popover defaultClass="py-2 px-3 bg-white rounded-lg font-['Inter']" triggeredBy="#b3" class="w-72 text-sm font-light text-gray-500 bg-white" placement="bottom-start">
    <div class="p-3 space-y-2">
        {#if image}
            <!-- svelte-ignore a11y-missing-attribute -->
            <img class="w-[50px] h-[50px]" src={image}/>
        {/if}
        <h3 class="text-lg text-black font-semibold">{header}</h3>
        {firstPara}
        <p>{secondPara}</p>
        <a href={buttonUrl} target="_blank" class="flex items-center font-medium text-primary-600 dark:text-primary-500 dark:hover:text-primary-600 hover:text-primary-700">
        {buttonText} <ChevronRightOutline class="w-2 h-2 ml-1.5 text-primary-600 dark:text-primary-500" />
        </a>
    </div>
</Popover>