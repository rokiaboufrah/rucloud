import axios from 'axios'

/** Pull a human-readable message out of an API error without assuming its shape. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: unknown; message?: unknown; detail?: unknown }
      | undefined

    if (typeof data?.error === 'string' && data.error) return data.error
    if (typeof data?.message === 'string' && data.message) return data.message
    if (Array.isArray(data?.message) && typeof data.message[0] === 'string') return data.message[0]
    if (typeof data?.detail === 'string' && data.detail) return data.detail
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
