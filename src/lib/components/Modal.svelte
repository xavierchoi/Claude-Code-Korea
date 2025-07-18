<script lang="ts">
	
	interface Props {
		open: boolean
		onClose: () => void
		title?: string
		children?: any
	}
	
	let { open, onClose, title = '', children }: Props = $props()
	let dialog: HTMLDialogElement
	
	$effect(() => {
		if (dialog && open) {
			dialog.showModal()
		} else if (dialog && !open) {
			dialog.close()
		}
	})
	
	function handleClose() {
		onClose()
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			handleClose()
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="rounded-lg shadow-xl p-0 backdrop:bg-black/50 m-auto"
	onclick={handleBackdropClick}
>
	<div class="bg-white rounded-lg max-w-md w-full">
		{#if title}
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">{title}</h2>
			</div>
		{/if}
		
		<div class="px-6 py-4">
			{@render children?.()}
		</div>
		
		<div class="px-6 py-4 border-t border-gray-200 flex justify-end">
			<button
				type="button"
				onclick={handleClose}
				class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
				aria-label="Close modal"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
	
	dialog {
		animation: fadeIn 0.2s ease-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>