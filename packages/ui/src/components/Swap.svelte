<script lang="ts">
    import { chains } from "../store/chains";
    import Select from "./Select.svelte";
    import { Router, type RouteChain, type RouteToken } from "../utils/router"
	import { onMount } from "svelte";
    import _ from "lodash";
	import { balances } from "../store/balances";
	import TruncateString from "./TruncateString.svelte";
	import type { SkipMsgs } from "../utils/skip";
	import type { RouteData } from "@0xsquid/sdk";
	import { state } from "../store/state";
	import { sendTxAlert, type Chain } from "../../../snapper/src/index";
	import Button from "./Button.svelte";
	import AlertModal from "./AlertModal.svelte";
    import { getERC20Balance } from "../utils/general";
	import { addTransaction } from "../store/transactions";
    import type { TransactionReceipt } from "@ethersproject/abstract-provider";
	import { snapId } from "../utils/snap";

    let sourceChain :RouteChain;
    let destinationChain :RouteChain;
    let sourceCoin: RouteToken;
    let destinationCoin: RouteToken;
    let allChains: RouteChain[] = [];
    let sourceTokens: RouteToken[] = [];
    let destTokens: RouteToken[] = [];
    let router: Router;
    let amount: number = 0;
    let uamount: number = 0;
    let chainAddress = "";
    let available = "0";
    let receiver = "";
    let editReceiver = false;
    let showEditButton = false;
    let showDetails = false;
    let copied = false;
    let copiedReciever = false;
    let route: SkipMsgs | RouteData | undefined;
    let estimatedReceiveAmount = 0;
    let slippage = 1;
    let estimatedTimeMetric: "Seconds" | "Minute(s)" = "Minute(s)";
    let estimatedTime = 1;
    let loading = false;
    let showAlert = false;
    let inputShown: "from" | "to" = "from";

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        copied = true;
        setTimeout(() => {
            copied = false;
        }, 1000);
    }

    const copyReceiver = (text: string) => {
        navigator.clipboard.writeText(text);
        copiedReciever = true;
        setTimeout(() => {
            copiedReciever = false;
        }, 1000);
    }

    const swapRoute = () => {
        let oldSourceChain = sourceChain;
        let oldSourceCoin = sourceCoin;
        let oldDestinationChain = destinationChain;
        let oldDestinationCoin = destinationCoin;
        destinationChain = oldSourceChain;
        destinationCoin = oldSourceCoin;
        sourceChain = oldDestinationChain;
        sourceCoin = oldDestinationCoin;
        update();
    }

    const getRoute = async () => {
        route = undefined;
        showAlert = false;
        loading = true;
        try {
            let fromChain: Chain | undefined;
            let toChain: Chain | undefined;
            fromChain = $chains.find(chain => chain.chain_id === sourceChain.chain_id);
            toChain = $chains.find(chain => chain.chain_id === destinationChain.chain_id);
            if (fromChain === undefined) {
                const fromChainEvm = router.squid.chains.find(chain => chain.chainId.toString() === sourceChain.chain_id);
                if (fromChainEvm != undefined) {
                    fromChain = await router.convertEVMToChainType(fromChainEvm);
                }
            }
            if (toChain === undefined) {
                const toChainEvm = router.squid.chains.find(chain => chain.chainId.toString() === destinationChain.chain_id);
                if (toChainEvm != undefined) {
                    toChain = await router.convertEVMToChainType(toChainEvm);
                }
            }
            if (fromChain === undefined || fromChain.address === undefined) {
                console.log(fromChain);
                throw new Error("Invalid source chain or source chain address.");
            }
            if (toChain === undefined || toChain.address === undefined) {
                console.log(toChain);
                throw new Error("Invalid destination chain or destination chain address.");
            }
            const res = await router.route(sourceChain, destinationChain, sourceCoin, destinationCoin, uamount.toString(), toChain?.address, fromChain?.address, slippage, $chains);
            
            loading = false;

            return res;
        } catch (e: any) {
            loading = false;
            console.error(e);
            $state.alertText = e.message ?? e.errors[0].message;
            $state.alertType = "danger";
            showAlert = true;
            throw e;
        }
    };

    const updateRouteState = (multiRoute: SkipMsgs | RouteData) => {
        if ('msgs' in multiRoute) {
            const skipRoute = multiRoute as SkipMsgs;
            // It is from Skip
            if (skipRoute.route.estimated_amount_out) {
                estimatedReceiveAmount = Number(skipRoute.route.estimated_amount_out)/Math.pow(10, destinationCoin.decimals);
                estimatedTime = 1
                estimatedTimeMetric = "Minute(s)";
            }
        } else {
            // It is from Squid
            const squidRoute = multiRoute as RouteData;
            // It is from Skip
            estimatedReceiveAmount = Number(squidRoute.estimate.toAmount)/Math.pow(10, destinationCoin.decimals);
            estimatedTimeMetric = squidRoute.estimate.estimatedRouteDuration <= 59 ? "Seconds" : "Minute(s)";
            estimatedTime = squidRoute.estimate.estimatedRouteDuration <= 59 ? squidRoute.estimate.estimatedRouteDuration : _.round(squidRoute.estimate.estimatedRouteDuration/60, 0);
        }
    }

    const executeRoute = async () => {
        loading = true;
        try {
            let fromChain: Chain | undefined;
            fromChain = $chains.find(chain => chain.chain_id === sourceChain.chain_id);
            if (fromChain === undefined) {
                const fromChainEvm = router.squid.chains.find(chain => chain.chainId.toString() === sourceChain.chain_id);
                if (fromChainEvm != undefined) {
                    fromChain = await router.convertEVMToChainType(fromChainEvm);
                }
            }
            if (fromChain === undefined || fromChain.address === undefined) {
                console.log(fromChain);
                throw new Error("Invalid source chain or source chain address.");
            }
            if (route === undefined) {
                route = await getRoute();
            }
            const tx = await router.execute(sourceChain, destinationChain, route, fromChain?.address, fromChain);
            loading = false;
            if ('code' in tx) {
                if (tx.code == 0) {
                    await addTransaction({address: chainAddress, chain: sourceChain.chain_id, when: new Date().toLocaleString(), tx_hash: tx.transactionHash});
                    await sendTxAlert(sourceChain.chain_name, tx.transactionHash, snapId);
                } else {
                    if (tx.rawLog) {
                        $state.alertText = tx.rawLog
                    } else {
                        $state.alertText = "There was an issue while submitting your transaction. View explorer for more details."
                    }
                    $state.alertType = "danger"
                    $state.showAlert = true
                }
            } else {
                const evmTx = tx as TransactionReceipt;
                await sendTxAlert(sourceChain.chain_name, evmTx.transactionHash, snapId);
            }
        } catch (e: any) {
            loading = false;
            console.error(e);
            $state.alertText = e.message;
            $state.alertType = "danger";
            showAlert = true;
        }
    }

    const update = async () => {
        showAlert = false;
        loading = true;
        if (sourceChain) {
            let fromChain: Chain | undefined;
            fromChain = $chains.find(chain => chain.chain_id === sourceChain.chain_id);
            if (fromChain === undefined) {
                const fromChainEvm = router.squid.chains.find(chain => chain.chainId.toString() === sourceChain.chain_id);
                if (fromChainEvm != undefined) {
                    fromChain = await router.convertEVMToChainType(fromChainEvm);
                }
            }
            if (fromChain && fromChain.address) {
                chainAddress = fromChain.address;
            }
        }
        if (destinationChain) {
            let toChain: Chain | undefined;
            toChain = $chains.find(chain => chain.chain_id === destinationChain.chain_id);
            if (toChain === undefined) {
                const toChainEvm = router.squid.chains.find(chain => chain.chainId.toString() === destinationChain.chain_id);
                if (toChainEvm != undefined) {
                    toChain = await router.convertEVMToChainType(toChainEvm);
                }
            }
            if (toChain && toChain.address) {
                receiver = toChain.address;
            }
        }
        if (router) {
            sourceTokens = await router.getTokens(sourceChain.chain_id);
            sourceTokens = _.uniqBy(sourceTokens, "denom");
            sourceTokens = _.uniqBy(sourceTokens, "ibc_denom");
            if (sourceChain && !sourceCoin && sourceTokens.length > 0) {
                sourceCoin = sourceTokens[0];
            }
            destTokens = await router.getTokens(destinationChain.chain_id)
            destTokens = _.uniqBy(destTokens, "denom");
            destTokens = _.uniqBy(destTokens, "ibc_denom");
            if (destinationChain && !destinationCoin && destTokens.length > 0) {
                destinationCoin = destTokens[0];
            }
            uamount = amount * Math.pow(10, sourceCoin.decimals);
            if(sourceChain && destinationChain && sourceCoin && destinationCoin && uamount > 0) {
                route = await getRoute();
                updateRouteState(route);
            }
            if (sourceTokens.find(token => token.denom == sourceCoin.denom) === undefined && sourceTokens.length > 0 && sourceCoin) {
                sourceCoin = sourceTokens[0];
            }
            if (destTokens.find(token => token.denom == destinationCoin.denom) === undefined && sourceTokens.length > 0 && destinationCoin) {
                destinationCoin = destTokens[0];
            }
        }
        if (sourceChain.rpc === undefined) {
            throw new Error(`No RPC found for chain ${sourceChain.chain_name}.`);
        }
        if (sourceChain && sourceCoin) {
            if (sourceChain.chain_type === "evm") {
                const availableU = await getERC20Balance(sourceCoin.denom, chainAddress, sourceChain.rpc);
                available = (_.round(Number(availableU)/Math.pow(10, sourceCoin.decimals), 2)).toString();
            } else {
                const chain = $balances.find(balance => balance.chain_id === sourceChain.chain_id);
                const availableU = chain?.balances.find(bal => bal.denom == sourceCoin.denom)?.amount ?? "0";
                available = (_.round(Number(availableU)/Math.pow(10, sourceCoin.decimals), 2)).toString();
            }
        }
        loading = false;
    }

    onMount(async () => {
        router = new Router();
        allChains = await router.getChains($chains);
        sourceChain = allChains.filter(chain => chain.chain_id === "cosmoshub-4")[0];
        destinationChain = allChains.filter(chain => chain.chain_id === "osmosis-1")[0];
        update();
    })
</script>

<div class="w-full max-w-[700px] p-[20px] font-inter bg-[#14141440] rounded-3xl border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100">
    <div class="w-full p-4">
        <div class="w-full">
            <div class="font-bold text-[20px] text-white text-xl tracking-tight leading-normal whitespace-nowrap">
                Swap
            </div>
        </div>
        <div class="w-full mt-4">
            <div class="flex flex-col">
                <div class="w-full mb-[10px] relative {inputShown === "to" ? "z-1000" : "z-50"}">
                    <div class="w-full rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-4">
                        <div class="flex flex-between">
                            <div class="w-1/2 font-medium text-white text-lg tracking-tight leading-normal">
                                From
                            </div>
                            {#if chainAddress}
                                <div class="flex justify-end items-center w-1/2 font-medium text-sm text-white tracking-tight leading-normal">
                                    <TruncateString cursor="default" str={chainAddress}/>
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    {#if copied}
                                        <svg class="w-6 h-full ml-2 cursor-pointer text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 3v4a1 1 0 0 1-1 1H5m4 6 2 2 4-4m4-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"/>
                                        </svg>
                                    {:else}
                                        <svg on:click={() => copy(chainAddress)} class="w-6 h-full ml-2 cursor-pointer text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
                                        </svg>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                        <div class="flex justify-center items-center gap-2">
                            <div class="w-1/2">
                                <Select on:open={() => inputShown = "from"} on:change={update} text="Select Chain" items={allChains} bind:selectedItem={sourceChain} showKey="chain_name" imageKey="logo_uri"/>
                            </div>
                            <div class="w-1/2">
                                <Select on:open={() => inputShown = "from"} on:change={update} text="Select Token" items={sourceTokens} bind:selectedItem={sourceCoin} showKey="display" imageKey="logo_uri"/>
                            </div>
                        </div>
                        <div>
                            <form>
                                <div class="relative justify-center items-center w-full">
                                    <input on:change={update} bind:value={amount} type="number" class="remove-arrow mt-3 custom-bg outline-none inter-font inline-flex w-full rounded-[10px] shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35 border border-gray-600 focus:border-none focus:outline-none" placeholder="Enter amount" required>
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div on:click={() => { amount = Number(available); update(); }} class="cursor-pointer absolute top-5 right-4 font-semibold text-[#FF414C] text-sm text-right">
                                        MAX
                                    </div>
                                </div>
                            </form>                            
                        </div>
                        <div class="available-balance-1454789 inter-medium-blueberry-14px">
                            Available: {available}
                        </div>
                    </div>
                </div>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={swapRoute} class="w-10 h-10 left-1/2 cursor-pointer z-[40] relative">
                    <img class="" src="/change-swap.svg" alt="change_positions"/>
                </div>
                <div class="w-full mt-[10px] relative  {inputShown === "from" ? "z-1000" : "z-50"}">
                    <div class="w-full rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-4">
                        <div class="flex flex-between items-center">
                            <div class="w-1/2 font-medium text-white text-lg tracking-tight leading-normal">
                                To
                            </div>
                            {#if receiver}
                                {#if !editReceiver}
                                    {#if !showEditButton}
                                        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                                        <div class="flex justify-end items-end w-1/2 font-medium text-sm text-white tracking-tight leading-normal">
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <div on:mouseover={() => showEditButton = true} on:click={() => editReceiver = !editReceiver}><TruncateString str={receiver}/></div>
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            {#if copiedReciever}
                                                <svg class="w-6 h-full ml-2 cursor-pointer text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 3v4a1 1 0 0 1-1 1H5m4 6 2 2 4-4m4-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"/>
                                                </svg>
                                            {:else}
                                                <svg on:click={() => copyReceiver(receiver)} class="w-6 h-full ml-2 cursor-pointer text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
                                                </svg>
                                            {/if}
                                        </div>
                                    {:else}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <div on:click={() => editReceiver = true} on:mouseleave={() => { showEditButton = false; editReceiver = false; }} class="flex justify-end items-center w-1/2 font-medium text-sm text-white tracking-tight leading-normal">
                                            <span class="w-full flex justify-end cursor-pointer text-white font-inter">
                                                Edit address
                                            </span>
                                            <svg class="w-6 h-full ml-2 cursor-pointer text-[#FF414C]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                                <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                                  <path d="M19 11V9a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L12 2.757V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L2.929 4.343a1 1 0 0 0 0 1.414l.536.536L2.757 8H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535L8 17.243V18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H18a1 1 0 0 0 1-1Z"/>
                                                  <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                                </g>
                                            </svg>                                        
                                        </div>
                                    {/if}
                                {:else}
                                    <input on:change={update} class="flex justify-end items-end w-1/2 tracking-tight leading-normal bg-transparent focus:outline-none custom-bg inter-font rounded-[10px] border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35" bind:value={receiver}/>
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <svg on:click={() => editReceiver = !editReceiver} class="w-5 h-full ml-2 cursor-pointer text-[#FF414C]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                                    </svg>
                                {/if}
                            {/if}
                        </div>
                        <div class="flex justify-between items-center gap-2">
                            <div class="w-1/2">
                                <Select on:open={() => inputShown = "to"} on:change={update} text="Select Chain" items={allChains} bind:selectedItem={destinationChain} showKey="chain_name" imageKey="logo_uri"/>
                            </div>
                            <div class="w-1/2">
                                <Select on:open={() => inputShown = "to"} on:change={update} text="Select Token" items={destTokens} bind:selectedItem={destinationCoin} showKey="display" imageKey="logo_uri"/>
                            </div>
                        </div>
                        <div class="relative flex justify-center items-center">
                            <input bind:value={estimatedReceiveAmount} disabled type="number" id="dest-amount" class="remove-arrow mt-3 custom-bg inter-font inline-flex w-full rounded-[10px] border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35" placeholder="Estimated receive amount" required>
                        </div>
                    </div>
                </div>
                {#if route}
                    <div class="w-full mt-4">
                        <div class="w-full rounded-lg border border-solid border-[#ffffff1a] backdrop-blur-lg backdrop-brightness-100 p-4">
                            <div class="flex">
                                <div class="w-1/2 font-medium text-white text-lg tracking-tight leading-normal">
                                    Details
                                </div>
                                <div class="flex w-1/2 items-center justify-end">
                                    <svg on:click={() => showDetails = !showDetails} class="w-5 h-full ml-2 cursor-pointer text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 1h4m0 0v4m0-4-5 5.243M5 15H1m0 0v-4m0 4 5.243-5"/>
                                    </svg>
                                </div>
                            </div>
                            {#if showDetails}
                                <div class="w-full flex flex-col">
                                    <div class="w-full flex">
                                        <div class="w-1/2 font-medium flex mt-3 font-inter text-white text-base">
                                            Estimated time
                                        </div>
                                        <div class="w-1/2 flex mt-3 font-inter text-white text-base justify-end">
                                            ~ {estimatedTime} {estimatedTimeMetric}
                                        </div>
                                    </div>
                                    <div class="w-full flex">
                                        <div class="w-1/2 font-medium flex mt-3 font-inter text-white text-base items-center">
                                            Max slippage (%)
                                        </div>
                                        <div class="w-1/2 flex mt-3 font-inter text-white text-base justify-end">
                                            <input type="number" on:change={update} bind:value={slippage} class="flex justify-end items-end w-1/2 tracking-tight leading-normal bg-transparent focus:outline-none custom-bg inter-font rounded-[10px] border border-gray-600 shadow-sm px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border-opacity-35"/>
                                        </div>
                                    </div>
                                    <div class="w-full flex">
                                        <div class="w-1/2 font-medium flex mt-3 font-inter text-white text-base">
                                            Exchange rate
                                        </div>
                                        <div class="w-1/2 flex mt-3 font-inter text-white text-base justify-end">
                                            {_.round((estimatedReceiveAmount/amount), 2)} {destinationCoin.display}/{sourceCoin.display}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        <AlertModal bind:display={showAlert} error={$state.alertText}/>
        <div style="display: {!showAlert ? "block" : "none"};"><Button bind:loading={loading} onClick={executeRoute} text="Swap" /></div>
    </div>
</div>

<style>
    .custom-bg {
        background-color: #141414;
        --tw-border-opacity: 0.35;
    }
    .custom-bg:focus {
        border: none;
        outline: none;
    }
    .remove-arrow::-webkit-inner-spin-button,
    .remove-arrow::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    .remove-arrow {
        -moz-appearance: textfield;
        appearance: textfield;
    }
    .available-balance-1454789 {
        align-self: flex-end;
        letter-spacing: -0.28px;
        line-height: normal;
        margin-right: 1px;
        margin-top: 10px;
        min-height: 17px;
        min-width: 180px;
        text-align: right;
    }
    .inter-medium-blueberry-14px {
        color: white;
        font-family: var(--font-family-inter);
        font-size: var(--font-size-m);
        font-style: normal;
        font-weight: 500;
    }
</style>