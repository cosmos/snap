<script>
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button } from 'flowbite-svelte'
</script>
  
<Navbar navClass="bg-black dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700 px-2 sm:px-4 py-2.5 w-full" let:hidden let:toggle>
    <NavBrand href="/">
        <img
        src="/logo.png"
        class="mr-3 h-6 sm:h-9"
        alt="Flowbite Logo"
        />
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Flowbite
        </span>
    </NavBrand>
    <div class="flex md:order-2">
        <Button color="light" size="sm">Connect Wallet</Button>
        <NavHamburger on:click={toggle} />
    </div>
    <NavUl {hidden} class="order-1">
        <NavLi href="/" active={true}>Home</NavLi>
        <NavLi href="/about">About</NavLi>
        <NavLi href="/services">Services</NavLi>
        <NavLi href="/pricing">Pricing</NavLi>
        <NavLi href="/contact">Contact</NavLi>
    </NavUl>
</Navbar>

<style>
</style>