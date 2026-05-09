function getBaseUrl() {
  try {
    return import.meta.env.BASE_URL
  } catch {
    return '/'
  }
}

function isExternalOrSpecialPath(path: string) {
  return (
    path.startsWith('#')
    || path.startsWith('//')
    || /^[a-z][a-z\d+\-.]*:/i.test(path)
  )
}

export function withPublicBase(path: string, baseUrl?: string): string
export function withPublicBase(path: undefined, baseUrl?: string): undefined
export function withPublicBase(path: string | undefined, baseUrl?: string): string | undefined
export function withPublicBase(path?: string, baseUrl = getBaseUrl()) {
  if (!path || !path.startsWith('/') || isExternalOrSpecialPath(path)) {
    return path
  }

  if (baseUrl === '/' || path.startsWith(baseUrl)) {
    return path
  }

  return `${baseUrl.replace(/\/$/, '')}${path}`
}
