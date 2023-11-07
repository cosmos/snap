<script lang="ts">
    import ChainSelector from "./ChainSelector.svelte";
    import Select from "./Select.svelte";
    import type { CoinIBC } from '../utils/ibc';
    import { balances } from "../store/balances";

    let sourceChain = "";
    let destinationChain = "";
    let sourceCoin = "";
    let destinationCoin = "";
    let sourceBalances: CoinIBC[] = [];
    let selected: any;

    $: {
        if ($balances) {
            let source_chain = $balances.filter(item => item.chain_id == sourceChain)[0];
            if (source_chain) {
            sourceBalances = source_chain.balances;
            }
        }
    }
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
                <div class="w-full mb-4">
                    <div class="w-full bg-[#14141480] rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-4">
                        <div class="opacity-25 font-medium text-white text-xs text-right">
                            Available balance: 0
                        </div>
                        <div class="font-medium text-white text-base tracking-tight leading-normal">
                            From
                        </div>
                        <div class="flex justify-between items-center mt-4 gap-2 z-50">
                            <div class="w-1/2">
                                <ChainSelector />
                            </div>
                            <div class="w-1/2">
                                <Select items={sourceBalances} bind:selectedItem={selected}/>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="bg-[#14141473] rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-2">
                                <div class="opacity-25 font-medium text-white text-sm">
                                    Enter amount
                                </div>
                                <div class="cursor-pointer absolute top-2 right-4 font-semibold text-[#594bff] text-sm text-right">
                                    MAX
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="absolute w-10 h-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="bg-[#594bff] rounded-lg">
                    </div>
                </div>
                <div class="w-full">
                    <div class="w-full bg-[#14141480] rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-4">
                        <div class="opacity-25 font-medium text-white text-xs text-right">
                            Available balance: 0
                        </div>
                        <div class="font-medium text-white text-base tracking-tight leading-normal">
                            To
                        </div>
                        <div class="flex justify-between items-center mt-4 gap-2 z-50">
                            <div class="w-1/2">
                                <ChainSelector />
                            </div>
                            <div class="w-1/2">
                                <Select items={sourceBalances} bind:selectedItem={selected}/>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="bg-[#14141473] rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-2">
                                <div class="opacity-25 font-medium text-white text-sm">
                                    Enter amount
                                </div>
                                <div class="cursor-pointer absolute top-2 right-4 font-semibold text-[#594bff] text-sm text-right">
                                    MAX
                                </div>
                            </div>
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
<style lang="scss">
    button {
        @apply active:scale-95 transition-all duration-300 cursor-pointer;
    }
</style>