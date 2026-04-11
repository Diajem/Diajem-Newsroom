export async function api(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('diajem_token') : null
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
