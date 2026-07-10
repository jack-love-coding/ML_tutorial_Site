import type { SiteNavigationMenuId } from '../../data/navigationMenus.ts'

export interface RenderedNavigationLink {
  id: string
  route: string
  label: string
  active: boolean
  exact: boolean
}

export interface RenderedNavigationGroup {
  id: string
  label: string
  items: RenderedNavigationLink[]
}

export interface RenderedNavigationItem {
  id: SiteNavigationMenuId
  label: string
  route?: string
  active: boolean
  exact: boolean
  groups: RenderedNavigationGroup[]
}

export type NavigationAriaCurrent = 'page' | 'location' | undefined

export function getNavigationAriaCurrent(
  exact: boolean,
  active: boolean,
): NavigationAriaCurrent {
  if (exact) return 'page'
  if (active) return 'location'
  return undefined
}
