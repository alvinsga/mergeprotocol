<script>
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
</script>

<div>
	<img src="https://via.placeholder.com/150" alt="" />
</div>
<div>Address:{$page.params.id}</div>

<div>
	<div>License:</div>
	<!-- Free license, paid license, royalty -->
</div>

<Button>Buy</Button>
