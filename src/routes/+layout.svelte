<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { supabase } from '$lib/supabase'

	let { children, data } = $props();

	onMount(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('Auth state changed:', event, !!session)
			
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				// Force invalidate to refresh all server-side data
				await invalidate('supabase:auth')
			}
		})

		return () => authListener.subscription.unsubscribe()
	})
</script>

{@render children()}
