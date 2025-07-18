<script lang="ts">
	export let data;
</script>

<div class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-6">관리자 대시보드</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white rounded-lg shadow p-6">
			<h3 class="text-lg font-semibold text-gray-600">총 사용자</h3>
			<p class="text-3xl font-bold mt-2">-</p>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<h3 class="text-lg font-semibold text-gray-600">총 게시글</h3>
			<p class="text-3xl font-bold mt-2">-</p>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<h3 class="text-lg font-semibold text-gray-600">총 댓글</h3>
			<p class="text-3xl font-bold mt-2">-</p>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<h3 class="text-lg font-semibold text-gray-600">활성 카테고리</h3>
			<p class="text-3xl font-bold mt-2">{data.activeCategories || 0}</p>
		</div>
	</div>
	
	<div class="mt-8">
		<h2 class="text-2xl font-bold mb-4">빠른 링크</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<a href="/admin/categories" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
				<h3 class="text-xl font-semibold mb-2">카테고리 관리</h3>
				<p class="text-gray-600">포럼 카테고리 추가, 수정, 삭제</p>
			</a>
			
			<a href="/admin/posts" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
				<h3 class="text-xl font-semibold mb-2">게시글 관리</h3>
				<p class="text-gray-600">게시글 관리 및 조정</p>
			</a>
			
			<a href="/admin/users" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
				<h3 class="text-xl font-semibold mb-2">사용자 관리</h3>
				<p class="text-gray-600">사용자 계정 관리</p>
			</a>
		</div>
	</div>
</div>