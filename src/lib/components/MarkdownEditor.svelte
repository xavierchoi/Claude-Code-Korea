<script lang="ts">
	import { onMount } from 'svelte';
	import { renderMarkdown } from '$lib/utils/markdown.client';
	
	export let value = '';
	export let placeholder = '마크다운으로 작성하세요...';
	export let minHeight = '300px';
	export let showPreview = true;
	
	let activeTab: 'write' | 'preview' = 'write';
	let renderedHtml = '';
	let textarea: HTMLTextAreaElement;
	
	// 마크다운 렌더링
	$: if (typeof window !== 'undefined' && value) {
		renderedHtml = renderMarkdown(value);
	} else {
		renderedHtml = '';
	}
	
	// 텍스트 에리어 자동 높이 조절
	function autoResize() {
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = Math.max(textarea.scrollHeight, parseInt(minHeight)) + 'px';
		}
	}
	
	// 마크다운 도움말 삽입
	function insertMarkdown(before: string, after: string = '') {
		if (!textarea) return;
		
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		const replacement = before + selectedText + after;
		
		value = value.substring(0, start) + replacement + value.substring(end);
		
		// 커서 위치 조정
		setTimeout(() => {
			textarea.focus();
			if (selectedText) {
				// 텍스트가 선택되어 있었다면 그대로 유지
				textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
			} else {
				// 텍스트가 없었다면 중간으로 이동
				textarea.setSelectionRange(start + before.length, start + before.length);
			}
		}, 0);
	}
	
	// 키보드 단축키
	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey) {
			switch (e.key) {
				case 'b':
					e.preventDefault();
					insertMarkdown('**', '**');
					break;
				case 'i':
					e.preventDefault();
					insertMarkdown('*', '*');
					break;
				case 'k':
					e.preventDefault();
					insertMarkdown('[', '](url)');
					break;
			}
		}
	}
	
	onMount(() => {
		autoResize();
	});
</script>

<div class="markdown-editor">
	{#if showPreview}
		<div class="tabs">
			<button
				class="tab {activeTab === 'write' ? 'active' : ''}"
				on:click={() => activeTab = 'write'}
			>
				작성
			</button>
			<button
				class="tab {activeTab === 'preview' ? 'active' : ''}"
				on:click={() => activeTab = 'preview'}
			>
				미리보기
			</button>
		</div>
	{/if}
	
	{#if activeTab === 'write' || !showPreview}
		<div class="editor-toolbar">
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('# ')}
				title="제목 (Ctrl+1)"
			>
				H1
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('**', '**')}
				title="굵게 (Ctrl+B)"
			>
				<strong>B</strong>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('*', '*')}
				title="기울임 (Ctrl+I)"
			>
				<em>I</em>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('~~', '~~')}
				title="취소선"
			>
				<del>S</del>
			</button>
			<div class="toolbar-separator"></div>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('[', '](url)')}
				title="링크 (Ctrl+K)"
			>
				🔗
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('![alt text](', ')')}
				title="이미지"
			>
				🖼️
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('```\n', '\n```')}
				title="코드 블록"
			>
				{'</>'}
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('`', '`')}
				title="인라인 코드"
			>
				{'`'}
			</button>
			<div class="toolbar-separator"></div>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('- ')}
				title="목록"
			>
				•
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('1. ')}
				title="번호 목록"
			>
				1.
			</button>
			<button
				type="button"
				class="toolbar-btn"
				on:click={() => insertMarkdown('> ')}
				title="인용문"
			>
				❝
			</button>
		</div>
		
		<textarea
			bind:this={textarea}
			bind:value
			on:input={autoResize}
			on:keydown={handleKeydown}
			{placeholder}
			class="editor-textarea"
			style="min-height: {minHeight}"
		/>
		
		<div class="editor-footer">
			<span class="text-xs text-gray-500">
				마크다운 문법을 지원합니다. <strong>Ctrl+B</strong> 굵게, <strong>Ctrl+I</strong> 기울임, <strong>Ctrl+K</strong> 링크
			</span>
		</div>
	{/if}
	
	{#if activeTab === 'preview' && showPreview}
		<div class="preview-container" style="min-height: {minHeight}">
			{#if renderedHtml}
				{@html renderedHtml}
			{:else}
				<p class="preview-empty">미리볼 내용이 없습니다.</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.markdown-editor {
		border: 1px solid rgb(209 213 219);
		border-radius: 0.5rem;
		overflow: hidden;
		background-color: white;
	}
	
	.tabs {
		display: flex;
		border-bottom: 1px solid rgb(229 231 235);
		margin-bottom: 0.5rem;
	}
	
	.tab {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: rgb(75 85 99);
		background: none;
		border: none;
		cursor: pointer;
		transition: color 0.15s;
	}
	
	.tab:hover {
		color: rgb(17 24 39);
	}
	
	.tab.active {
		color: rgb(37 99 235);
		border-bottom: 2px solid rgb(37 99 235);
		margin-bottom: -1px;
	}
	
	.editor-toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		border-bottom: 1px solid rgb(229 231 235);
		background-color: rgb(249 250 251);
	}
	
	.toolbar-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
		color: rgb(55 65 81);
		background: none;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	
	.toolbar-btn:hover {
		background-color: rgb(229 231 235);
	}
	
	.toolbar-separator {
		width: 1px;
		height: 1.5rem;
		background-color: rgb(209 213 219);
		margin: 0 0.25rem;
	}
	
	.editor-textarea {
		width: 100%;
		padding: 1rem;
		border: 0;
		resize: none;
		outline: none;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
	
	.editor-footer {
		padding: 0.5rem 1rem;
		background-color: rgb(249 250 251);
		border-top: 1px solid rgb(229 231 235);
		color: rgb(107 114 128);
		font-size: 0.75rem;
	}
	
	.preview-container {
		padding: 1rem;
		font-family: inherit;
	}
	
	.preview-empty {
		color: rgb(156 163 175);
	}
	
	/* 마크다운 프리뷰 스타일 */
	.preview-container :global(h1) {
		font-size: 1.875rem;
		font-weight: 700;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}
	
	.preview-container :global(h2) {
		font-size: 1.5rem;
		font-weight: 700;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}
	
	.preview-container :global(h3) {
		font-size: 1.25rem;
		font-weight: 700;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}
	
	.preview-container :global(p) {
		margin-bottom: 1rem;
		line-height: 1.75;
	}
	
	.preview-container :global(ul) {
		list-style-type: disc;
		padding-left: 2rem;
		margin-bottom: 1rem;
	}
	
	.preview-container :global(ol) {
		list-style-type: decimal;
		padding-left: 2rem;
		margin-bottom: 1rem;
	}
	
	.preview-container :global(li) {
		margin-bottom: 0.25rem;
	}
	
	.preview-container :global(blockquote) {
		border-left: 4px solid rgb(209 213 219);
		padding-left: 1rem;
		font-style: italic;
		margin: 1rem 0;
		color: rgb(75 85 99);
	}
	
	.preview-container :global(pre) {
		background-color: rgb(243 244 246);
		border-radius: 0.5rem;
		padding: 1rem;
		overflow-x: auto;
		margin: 1rem 0;
	}
	
	.preview-container :global(code) {
		background-color: rgb(243 244 246);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
	}
	
	.preview-container :global(pre code) {
		background-color: transparent;
		padding: 0;
	}
	
	.preview-container :global(a) {
		color: rgb(37 99 235);
		text-decoration: underline;
	}
	
	.preview-container :global(a:hover) {
		color: rgb(29 78 216);
	}
	
	.preview-container :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}
	
	.preview-container :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
	}
	
	.preview-container :global(th) {
		background-color: rgb(249 250 251);
		padding: 0.5rem 1rem;
		text-align: left;
		font-weight: 500;
		border-bottom: 1px solid rgb(229 231 235);
	}
	
	.preview-container :global(td) {
		padding: 0.5rem 1rem;
		border-bottom: 1px solid rgb(229 231 235);
	}
</style>