<script>
	import '../app.postcss';
	import NavBar from '../components/NavBar.svelte';
</script>

<body class="w-full h-full bg-black">
    <div class="bg-black">
        <NavBar />
    </div>
    <slot />
</body>

<style>
</style>
