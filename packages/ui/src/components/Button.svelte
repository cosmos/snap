<script lang="ts">
    export let onClick: Function = () => {}
    export let loading = false;
    export let text = "Transfer";
    export let disabled: boolean = false;
</script>

<button disabled={loading || disabled} on:click={() => onClick()} class="frame-1-2 frame-1-4 button-send disabled:opacity-[0.40]">
    <div class="send-amount-1 inter-medium-white-12px">
        {#if loading}
          <div role="status">
              <svg aria-hidden="true" class="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-grey-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span class="sr-only">Loading...</span>
          </div>
        {:else}
          {text}
        {/if}
    </div>
</button>

<style>
.frame-1-2 {
  margin-left: 1px;
  margin-top: 35px;
  width: 272px;
}

.frame-1-4 {
  align-items: center;
  background-color: var(--blueberry);
  border-radius: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  overflow: hidden;
  padding: 13px 23px;
  width: 100%;
}

.send-amount-1 {
  letter-spacing: -0.24px;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  width: fit-content;
}

.inter-medium-white-12px {
  color: var(--white);
  font-family: var(--font-family-inter);
  font-size: var(--font-size-s);
  font-style: normal;
  font-weight: 500;
}

.button-send {
  letter-spacing: -0.36px;
  line-height: normal;
  margin-top: 15px;
  position: relative;
  width: fit-content;
  height: 40px;
  min-width: 100px;
  width: 100%;
}

.button-send:hover {
  background-color: var(--blueberry);
  filter: brightness(1.1);
}
</style>