<script lang="ts">
	import { onMount } from 'svelte'
	
	let postId = '1' // Test post ID
	let sessionInfo = $state<any>(null)
	
	onMount(async () => {
		// 현재 세션 정보 가져오기
		const response = await fetch('/api/auth/session')
		if (response.ok) {
			sessionInfo = await response.json()
		}
	})
</script>

<div class="max-w-4xl mx-auto p-8">
	<h1 class="text-3xl font-bold mb-8">실시간 댓글 테스트</h1>
	
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
		<h2 class="text-lg font-semibold mb-2">테스트 방법</h2>
		<ol class="list-decimal list-inside space-y-2 text-sm">
			<li>두 개의 브라우저 창 또는 탭을 열어주세요</li>
			<li>두 창 모두에서 이 페이지로 이동하세요</li>
			<li>한 창에서 댓글을 작성하면 다른 창에서 실시간으로 표시됩니다</li>
			<li>댓글 수정/삭제도 실시간으로 동기화됩니다</li>
		</ol>
	</div>
	
	{#if sessionInfo}
		<div class="bg-gray-100 rounded-lg p-4 mb-8">
			<p class="text-sm">
				<strong>현재 사용자:</strong> {sessionInfo.user?.email || '로그인되지 않음'}
			</p>
		</div>
	{/if}
	
	<div class="bg-white rounded-lg shadow-lg p-6">
		<h2 class="text-xl font-bold mb-4">테스트 게시물</h2>
		<p class="text-gray-600 mb-8">이 게시물의 댓글은 실시간으로 업데이트됩니다.</p>
		
		<!-- 실제 게시물의 댓글 컴포넌트를 임베드 -->
		<iframe 
			src="/forum/general/1"
			class="w-full h-[800px] border rounded"
			title="실시간 댓글 테스트"
		></iframe>
	</div>
	
	<div class="mt-8 text-sm text-gray-600">
		<h3 class="font-semibold mb-2">실시간 기능 확인 사항:</h3>
		<ul class="list-disc list-inside space-y-1">
			<li>새 댓글 작성 시 페이지 새로고침 없이 즉시 표시</li>
			<li>댓글 수정 시 다른 사용자 화면에도 즉시 반영</li>
			<li>댓글 삭제 시 다른 사용자 화면에서도 즉시 제거</li>
			<li>댓글 개수가 실시간으로 업데이트</li>
		</ul>
	</div>
</div>