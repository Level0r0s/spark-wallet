import { writable } from 'svelte/store'
import { persistent } from '~/lib/helpers'

/**
 * Notification content
 */
export const notification = writable<string>(null)

/**
 * Error content
 */
export const error = writable<string>(null)

/**
 * Dark mode enabled state¬
 */
export const darkMode = persistent<boolean>('darkMode', false)

/**
 * Unset notification timeout
 */
let notificationTimeout: NodeJS.Timeout

notification.subscribe((item) => {
    clearTimeout(notificationTimeout)
    if (item) {
        notificationTimeout = global.setTimeout(() => {
            notification.set(null)
        }, 2400)
    }
})

/**
 * Unset notification timeout
 */
let errorTimeout: NodeJS.Timeout

error.subscribe((item) => {
    clearTimeout(errorTimeout)
    if (item) {
        errorTimeout = global.setTimeout(() => {
            error.set(null)
        }, 2400)
    }
})
