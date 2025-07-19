<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/utils/format';
	
	// Icons
	import EyeIcon from 'heroicons/24/outline/eye.svg?raw';
	import HandThumbUpIcon from 'heroicons/24/outline/hand-thumb-up.svg?raw';
	import HandThumbDownIcon from 'heroicons/24/outline/hand-thumb-down.svg?raw';
	import ChatBubbleLeftEllipsisIcon from 'heroicons/24/outline/chat-bubble-left-ellipsis.svg?raw';
	import ShareIcon from 'heroicons/24/outline/share.svg?raw';
	import PencilSquareIcon from 'heroicons/24/outline/pencil-square.svg?raw';
	import TrashIcon from 'heroicons/24/outline/trash.svg?raw';
	import LockClosedIcon from 'heroicons/24/outline/lock-closed.svg?raw';
	import ExclamationTriangleIcon from 'heroicons/24/outline/exclamation-triangle.svg?raw';
	
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	let showDeleteModal = false;
	let isDeleting = false;
	
	async function handleDelete() {
		if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
			return;
		}
		
		isDeleting = true;
		
		const response = await fetch(`/api/posts/${data.post.id}`, {
			method: 'DELETE'
		});
		
		if (response.ok) {
			goto('/');
		} else {
			alert('게시글 삭제 중 오류가 발생했습니다.');
			isDeleting = false;
		}
	}
	
	function handleEdit() {
		goto(`/posts/edit/${data.post.id}`);
	}
	
	function handleShare() {
		if (navigator.share) {
			navigator.share({
				title: data.post.title,
				url: window.location.href
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			alert('링크가 클립보드에 복사되었습니다.');
		}
	}
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- 게시글 헤더 -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
		<!-- 카테고리 및 메타 정보 -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center space-x-2">
				<a 
					href="/" 
					class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
					style="background-color: {data.post.category?.color || '#6b7280'}20; color: {data.post.category?.color || '#6b7280'}"
				>
					{data.post.category?.name || '일반'}
				</a>
				<span class="text-gray-400">·</span>
				<time class="text-sm text-gray-500">
					{formatDate(data.post.created_at)}
				</time>
			</div>
			
			<!-- 작성자/관리자 액션 -->
			{#if data.isAuthor || data.isAdmin}
				<div class="flex items-center space-x-2">
					<button
						onclick={handleEdit}
						class="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
						title="수정"
					>
						<div class="w-5 h-5">
							{@html PencilSquareIcon}
						</div>
					</button>
					<button
						onclick={handleDelete}
						disabled={isDeleting}
						class="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
						title="삭제"
					>
						<div class="w-5 h-5">
							{@html TrashIcon}
						</div>
					</button>
				</div>
			{/if}
		</div>
		
		<!-- 제목 -->
		<h1 class="text-2xl font-bold text-gray-900 mb-4">
			{data.post.title}
		</h1>
		
		<!-- 작성자 정보 -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-3">
				{#if data.post.author?.avatar_url}
					<img 
						src={data.post.author.avatar_url} 
						alt={data.post.author.username}
						class="w-10 h-10 rounded-full"
					/>
				{:else}
					<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
						<span class="text-gray-600 font-medium">
							{data.post.author?.username?.charAt(0).toUpperCase() || '?'}
						</span>
					</div>
				{/if}
				<div>
					<a 
						href="/users/{data.post.author?.username}" 
						class="font-medium text-gray-900 hover:text-blue-600"
					>
						{data.post.author?.full_name || data.post.author?.username || 'Anonymous'}
					</a>
					<div class="text-sm text-gray-500">
						@{data.post.author?.username || 'anonymous'}
					</div>
				</div>
			</div>
			
			<!-- 통계 -->
			<div class="flex items-center space-x-4 text-sm text-gray-500">
				<div class="flex items-center space-x-1">
					<div class="w-4 h-4">
						{@html EyeIcon}
					</div>
					<span>{data.post.view_count || 0}</span>
				</div>
				<div class="flex items-center space-x-1">
					<div class="w-4 h-4">
						{@html HandThumbUpIcon}
					</div>
					<span>{data.post.like_count || 0}</span>
				</div>
				<div class="flex items-center space-x-1">
					<div class="w-4 h-4">
						{@html ChatBubbleLeftEllipsisIcon}
					</div>
					<span>{data.post.comment_count || 0}</span>
				</div>
			</div>
		</div>
	</div>
	
	<!-- 게시글 본문 -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
		<div class="prose prose-lg max-w-none">
			{@html data.post.content}
		</div>
	</div>
	
	<!-- 액션 버튼 -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<button
					class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					<div class="w-5 h-5">
						{@html HandThumbUpIcon}
					</div>
					<span>추천</span>
					<span class="font-medium">{data.post.like_count || 0}</span>
				</button>
				<button
					class="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					<div class="w-5 h-5">
						{@html HandThumbDownIcon}
					</div>
					<span>비추천</span>
				</button>
			</div>
			
			<div class="flex items-center space-x-2">
				<button
					onclick={handleShare}
					class="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
					title="공유"
				>
					<div class="w-5 h-5">
						{@html ShareIcon}
					</div>
				</button>
				<button
					class="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
					title="신고"
				>
					<div class="w-5 h-5">
						{@html ExclamationTriangleIcon}
					</div>
				</button>
			</div>
		</div>
	</div>
	
	<!-- 댓글 섹션 -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">
			댓글 {data.post.comment_count || 0}개
		</h2>
		
		{#if data.post.is_locked}
			<div class="flex items-center space-x-2 text-gray-500 p-4 bg-gray-50 rounded-lg">
				<div class="w-5 h-5">
					{@html LockClosedIcon}
				</div>
				<span>이 게시글은 댓글을 작성할 수 없습니다.</span>
			</div>
		{:else}
			<div class="text-center py-8 text-gray-500">
				댓글 기능은 준비 중입니다.
			</div>
		{/if}
	</div>
</div>