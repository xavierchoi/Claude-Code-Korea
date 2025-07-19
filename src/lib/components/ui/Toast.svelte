<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	import { toast } from '$lib/stores/toast'
	import type { Toast as ToastType } from '$lib/stores/toast'
	
	let toasts: ToastType[] = []
	
	$: toasts = $toast
	
	function getIcon(type: ToastType['type']) {
		switch (type) {
			case 'success':
				return '✓'
			case 'error':
				return '✕'
			case 'info':
				return 'ℹ'
		}
	}
	
	function getClass(type: ToastType['type']) {
		switch (type) {
			case 'success':
				return 'toast-success'
			case 'error':
				return 'toast-error'
			case 'info':
				return 'toast-info'
		}
	}
</script>

<div class="toast-container">
	{#each toasts as toastItem (toastItem.id)}
		<div
			class="toast {getClass(toastItem.type)}"
			in:fly={{ y: -20, duration: 200 }}
			out:fade={{ duration: 200 }}
		>
			<span class="toast-icon">{getIcon(toastItem.type)}</span>
			<span class="toast-message">{toastItem.message}</span>
			<button
				class="toast-close"
				onclick={() => toast.remove(toastItem.id)}
				aria-label="닫기"
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 10px;
		pointer-events: none;
	}
	
	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		pointer-events: auto;
		min-width: 250px;
		max-width: 400px;
		animation: slideIn 0.2s ease-out;
	}
	
	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	
	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		font-weight: bold;
		flex-shrink: 0;
	}
	
	.toast-success {
		border-left: 4px solid #10b981;
	}
	
	.toast-success .toast-icon {
		background: #10b981;
		color: white;
	}
	
	.toast-error {
		border-left: 4px solid #ef4444;
	}
	
	.toast-error .toast-icon {
		background: #ef4444;
		color: white;
	}
	
	.toast-info {
		border-left: 4px solid #6366f1;
	}
	
	.toast-info .toast-icon {
		background: #6366f1;
		color: white;
	}
	
	.toast-message {
		flex: 1;
		color: #1f2937;
		font-size: 0.875rem;
		line-height: 1.5;
	}
	
	.toast-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #9ca3af;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}
	
	.toast-close:hover {
		color: #4b5563;
	}
	
	/* Mobile responsive */
	@media (max-width: 640px) {
		.toast-container {
			left: 10px;
			right: 10px;
			top: 10px;
		}
		
		.toast {
			width: 100%;
			max-width: none;
		}
	}
</style>