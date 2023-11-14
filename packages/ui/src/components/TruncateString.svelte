<script>
	export let str = 'This is very long text that will be truncated';
	export let cursor = 'pointer';
	let totalChars = Math.round(str.length / 2);
	let endChars = 10;
	/**
	 * @type {string | any[]}
	 */
	let text;

	$: {
		totalChars = Math.round(str.length / 2);
		text = truncate(str, totalChars, endChars);
	}
	
	/**
	 * @param {string | any[]} text
	 * @param {number} totalChars
	 */
	function truncate(text, totalChars, endChars = 0) {
		endChars = Math.min(endChars, totalChars);
		const start = text.slice(0, 10);
		const end = totalChars - endChars > 0 ? text.slice(-endChars) : '';
		
		return start + '…' + end;
	}
</script>

<span class="w-full flex justify-end cursor-{cursor}">
	{text}
</span>

<style>
	:global(body) {
		display: grid;
		place-items: center;
	}
</style>