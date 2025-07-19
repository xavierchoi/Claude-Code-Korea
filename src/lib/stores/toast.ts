import { writable } from 'svelte/store'

export interface Toast {
	id: string
	message: string
	type: 'success' | 'error' | 'info'
	duration?: number
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([])

	let timeouts = new Map<string, NodeJS.Timeout>()

	return {
		subscribe,
		
		show(message: string, type: Toast['type'] = 'info', duration = 3000) {
			const id = Date.now().toString()
			const toast: Toast = { id, message, type, duration }
			
			update(toasts => [...toasts, toast])
			
			// Auto-remove after duration
			const timeout = setTimeout(() => {
				this.remove(id)
			}, duration)
			
			timeouts.set(id, timeout)
		},
		
		remove(id: string) {
			update(toasts => toasts.filter(t => t.id !== id))
			
			// Clear timeout if exists
			const timeout = timeouts.get(id)
			if (timeout) {
				clearTimeout(timeout)
				timeouts.delete(id)
			}
		},
		
		success(message: string, duration?: number) {
			this.show(message, 'success', duration)
		},
		
		error(message: string, duration?: number) {
			this.show(message, 'error', duration)
		},
		
		info(message: string, duration?: number) {
			this.show(message, 'info', duration)
		}
	}
}

export const toast = createToastStore()