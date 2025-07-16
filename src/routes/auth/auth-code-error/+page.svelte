<script lang="ts">
	import { page } from '$app/stores'
	
	$: error = $page.url.searchParams.get('error')
	$: description = $page.url.searchParams.get('description')
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h2 class="mt-6 text-3xl font-extrabold text-gray-900">
				인증 오류
			</h2>
			<p class="mt-2 text-sm text-gray-600">
				로그인 중 문제가 발생했습니다.
			</p>
			
			{#if error}
				<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm font-medium text-red-800">오류 코드: {error}</p>
					{#if description}
						<p class="text-sm text-red-600 mt-1">{decodeURIComponent(description)}</p>
					{/if}
				</div>
			{/if}
			
			<a 
				href="/auth" 
				class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
			>
				다시 로그인하기
			</a>
		</div>
	</div>
</div>