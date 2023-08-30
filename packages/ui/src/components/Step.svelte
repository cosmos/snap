<script lang="ts">
    export let stepNumber: string;
    export let stepTitle: string;
    export let stepLongTitle: string;
    export let stepImage: string;
    export let stepDescription: string;
    export let stepLongDescription: string;
    export let actionText: string = '';
    export let action: () => any
    export let complete: boolean = false;
    export let disabled: boolean = true;
</script>

<div class="overlap-group1">
    <div class="flex-row-1 flex-row-3">
    <div class="step-2 step inter-bold-blueberry-14px">STEP {stepNumber}</div>
    {#if complete}
      <img
        class="done-1"
        src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/done-1.svg"
        alt="complete"
      />
    {:else}
    <img
        class="done-1"
        src="https://anima-uploads.s3.amazonaws.com/projects/64863aebc1255e7dd4fb600b/releases/64863c03ac0993f6e77c817f/img/clear.svg"
        alt="uncomplete"
      />
    {/if}
    </div>
    <div class="group-9-1 group-9-3">
    <img
        class="image-3"
        src="{stepImage}"
        alt="image 3"
    />
    <div class="group-7-1 group-7-3">
        <div class="lets-get-started inter-bold-white-16px">
        {stepTitle}
        </div>
        <p class="login-in-your-meta-ma inter-normal-white-12px">
        {stepDescription}
        </p>
    </div>
      <button disabled={disabled} class="frame-1-2 frame-1-4 sign-in-meta-mask inter-medium-white-12px" on:click={action}>
        {actionText}
      </button>
    </div>
    <div class="group-10-1 s-y_bCXRrkrYfP">
      <div class="install-metamask inter-bold-white-20px s-y_bCXRrkrYfP">
        {stepLongTitle}
      </div> 
      <p class="download-and-install inter-normal-white-14px s-y_bCXRrkrYfP">
        {stepLongDescription}
      </p>
    </div>
</div>

<style>
  .inter-bold-blueberry-14px {
    color: var(--blueberry);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-m);
    font-style: normal;
    font-weight: 700;
  }

  .inter-bold-white-16px {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-s2);
    font-style: normal;
    font-weight: 700;
  }

  .inter-normal-white-12px {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-s);
    font-style: normal;
    font-weight: 400;
  }

  .frame-1-4 {
    align-items: center;
    background-color: var(--blueberry);
    border-radius: 10px;
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
    overflow: hidden;
    padding: 10px 16px;
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

  .step {
      letter-spacing: 2.1px;
      line-height: normal;
      margin-bottom: 1px;
      min-height: 17px;
  }

  .flex-row-1 {
      gap: 179px;
  }

  .flex-row-3 {
      align-items: center;
      display: flex;
      margin-left: 2px;
      min-width: 262px;
  }

  .overlap-group1 {
      -webkit-backdrop-filter: blur(15px) brightness(100%);
      align-items: center;
      backdrop-filter: blur(15px) brightness(100%);
      background-color: var(--licorice);
      border: 1px solid;
      border-color: var(--white-2);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      padding: 24px 0;
      width: 310px;
  }

  .step-2 {
    min-width: 59px;
  }

  .step {
    letter-spacing: 2.1px;
    line-height: normal;
    margin-bottom: 1px;
    min-height: 17px;
  }

  .done-1 {
    height: 24px;
    width: 24px;
  }

  .group-9-1 {
    align-items: center;
    padding: 16px 47px;
  }

  .group-9-3 {
    -webkit-backdrop-filter: blur(15px) brightness(100%);
    backdrop-filter: blur(15px) brightness(100%);
    background-color: var(--licorice-2);
    border: 1px solid;
    border-color: var(--white-2);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    margin-right: 1px;
    margin-top: 10px;
    min-height: 220px;
    width: 263px;
  }

  .image-3 {
    height: 60px;
    margin-right: 3px;
    width: 60px;
  }

  .group-7-1 {
    align-items: center;
    align-self: flex-start;
    margin-top: 17px;
    width: 166px;
  }

  .group-7-3 {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 57px;
  }

  .lets-get-started {
    letter-spacing: -0.32px;
    line-height: normal;
    margin-left: 3px;
    min-height: 19px;
    min-width: 123px;
    text-align: center;
    white-space: nowrap;
  }

  .login-in-your-meta-ma {
    letter-spacing: -0.24px;
    line-height: 16px;
    min-height: 32px;
    min-width: 166px;
    opacity: 0.45;
    text-align: center;
  }

  .frame-1-2 {
    margin-right: 2px;
  }

  .frame-1-4 {
    align-items: center;
    background-color: var(--blueberry);
    border-radius: 10px;
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 35px;
    overflow: hidden;
    padding: 10px 16px;
    position: relative;
    width: fit-content;
  }

  .sign-in-meta-mask {
    letter-spacing: -0.36px;
    line-height: normal;
    margin-top: 15px;
    position: relative;
    width: fit-content;
    height: 35px;
    min-width: 100px;
  }

  .sign-in-meta-mask:hover {
    background-color: var(--blueberry);
    filter: brightness(1.1);
  }

  .sign-in-meta-mask:disabled {
    background-color: var(--blueberry);
    opacity: 0.50;
  }

  .group-10-1 {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    min-height: 78px;
    width: 266px;
  }

  .install-metamask {
    letter-spacing: -0.6px;
    line-height: normal;
    margin-right: 4px;
    min-height: 24px;
    min-width: 158px;
    text-align: center;
    white-space: nowrap;
  }

  .inter-bold-white-20px {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-m2);
    font-style: normal;
    font-weight: 700;
  }

  .download-and-install {
    letter-spacing: -0.28px;
    line-height: 22px;
    margin-right: 4px;
    min-height: 44px;
    opacity: 0.45;
    text-align: center;
    width: 262px;
  }

  .inter-normal-white-14px {
    color: var(--white);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-m);
    font-style: normal;
    font-weight: 400;
  }

  /* Responsive Styles */
  @media (max-width: 768px) { /* adjust for tablet and below */
    :root {
      --responsive-gap: 5px;
      --responsive-font-size: 12px;
      --responsive-padding: 5px 8px;
      --responsive-margin: 10px;
    }

    .inter-bold-blueberry-14px {
      font-size: var(--responsive-font-size);
    }

    .frame-1-4 {
      gap: var(--responsive-gap);
      padding: var(--responsive-padding);
      margin-top: var(--responsive-margin);
    }

    .flex-row-1 {
      gap: 100px; /* reduced gap for smaller screens */
    }

    .group-9-3 {
      width: 240px; /* reduced width */
    }

    .flex-row-3 {
      align-items: center;
      display: flex;
      margin-left: 2px;
      min-width: 262px;
      justify-content: space-between;
    }
  }

  @media (max-width: 480px) { /* adjust for mobile and below */
    :root {
      --responsive-gap: 3px;
      --responsive-font-size: 11px;
      --responsive-padding: 3px 6px;
      --responsive-margin: 7px;
    }

    .inter-bold-blueberry-14px {
      font-size: var(--responsive-font-size);
    }

    .frame-1-4 {
      gap: var(--responsive-gap);
      padding: var(--responsive-padding);
      margin-top: var(--responsive-margin);
    }

    .flex-row-1 {
      gap: 50px; /* further reduced gap for mobile screens */
    }

    .overlap-group1 {
      width: 260px; /* further reduced width */
    }

    .group-9-3 {
      width: 220px; /* further reduced width */
    }

    .sign-in-meta-mask {
      height: 35px;
      min-width: 100px;
    }
  }
</style>