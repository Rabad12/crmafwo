export function formatRupiah(value) {
  const n = Number(value) || 0
  return 'Rp' + n.toLocaleString('id-ID')
}

export function formatNumber(value) {
  const n = Number(value) || 0
  return n.toLocaleString('id-ID')
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function toIDRShort(value) {
  const n = Number(value) || 0
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'jt'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'rb'
  return String(n)
}