<script lang="ts">
    import Select from "./Select.svelte";
    import { Router, type RouteChain, type RouteToken } from "../utils/router"
	import { afterUpdate, onMount } from "svelte";
    import _ from "lodash";

    let sourceChain :RouteChain;
    let destinationChain :RouteChain;
    let sourceCoin: RouteToken;
    let destinationCoin: RouteToken;
    let chains: RouteChain[] = [];
    let sourceTokens: RouteToken[] = [];
    let destTokens: RouteToken[] = [];
    let router: Router;

    $: {
        if (router) {
            router.getTokens(sourceChain.chain_id).then((tokens) => {
                sourceTokens = _.uniqBy(tokens, "denom");
            });
            router.getTokens(destinationChain.chain_id).then((tokens) => {
                destTokens = _.uniqBy(tokens, "denom");
                console.log(destTokens);
            });
        }
    }

    onMount(async () => {
        router = new Router();
        setTimeout(async () => {
            chains = await router.getChains();
        }, 1000);
    })
</script>

<div class="w-full max-w-[700px] p-[20px] font-inter bg-[#14141440] rounded-3xl border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100">
    <div class="w-full p-4">
        <div class="w-full">
            <div class="font-bold text-[20px] text-white text-lg tracking-tight leading-normal whitespace-nowrap">
                Swap
            </div>
        </div>
        <div class="w-full mt-4">
            <div class="">
                <div class="w-full mb-4 z-50 relative">
                    <div class="w-full rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-4">
                        <div class="opacity-25 font-medium text-white text-xs text-right">
                            Available balance: 0
                        </div>
                        <div class="font-medium text-white text-base tracking-tight leading-normal">
                            From
                        </div>
                        <div class="flex justify-between items-center gap-2 z-50">
                            <div class="w-1/2">
                                <Select text="Select Chain" items={chains} bind:selectedItem={sourceChain} showKey="chain_name" imageKey="logo_uri"/>
                            </div>
                            <div class="w-1/2">
                                <Select text="Select Token" items={sourceTokens} bind:selectedItem={sourceCoin} showKey="display" imageKey="logo_uri"/>
                            </div>
                        </div>
                        <div class="">
                            <form>   
                                <div class="relative flex justify-center items-center">
                                    <input type="number" id="dest-amount" class="remove-arrow mt-3 custom-bg outline-none inter-font inline-flex w-full rounded-[10px] border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35 active:border-none focus-visible:border-none focus:border-none" placeholder="Enter amount" required>
                                    <div class="cursor-pointer absolute top-5 right-4 font-semibold text-[#594bff] text-sm text-right">
                                        MAX
                                    </div>
                                </div>
                            </form>                            
                        </div>
                    </div>
                </div>
                <div class="absolute w-10 h-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="bg-[#594bff] rounded-lg">
                    </div>
                </div>
                <div class="w-full">
                    <div class="w-full rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-4">
                        <div class="opacity-25 font-medium text-white text-xs text-right">
                            Available balance: 0
                        </div>
                        <div class="font-medium text-white text-base tracking-tight leading-normal">
                            To
                        </div>
                        <div class="flex justify-between items-center gap-2 z-50">
                            <div class="w-1/2">
                                <Select text="Select Chain" items={chains} bind:selectedItem={destinationChain} showKey="chain_name" imageKey="logo_uri"/>
                            </div>
                            <div class="w-1/2">
                                <Select text="Select Token" items={destTokens} bind:selectedItem={destinationCoin} showKey="display" imageKey="logo_uri"/>
                            </div>
                        </div>
                        <div class="">
                            <form>   
                                <div class="relative flex justify-center items-center">
                                    <input disabled type="number" id="dest-amount" class="remove-arrow mt-3 custom-bg inter-font inline-flex w-full rounded-[10px] border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35 active:border-none focus:border-none focus-visible:border-none" placeholder="Enter amount" required>
                                </div>
                            </form>                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="cursor-pointer h-[45px] mt-[20px] w-full flex items-center justify-center bg-[#594bff] rounded-lg overflow-hidden">
            <div class="font-medium text-white text-sm tracking-tight leading-normal">
                Swap
            </div>
        </button>
    </div>
</div>

<style>
    button:active {
        transform: scale(0.95);
        transition: all 0.3s;
        cursor: pointer;
    }
    .custom-bg {
        background-color: #141414;
        --tw-border-opacity: 0.35;
    }
    .remove-arrow::-webkit-inner-spin-button,
    .remove-arrow::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    .remove-arrow {
        -moz-appearance: textfield;
    }
</style>