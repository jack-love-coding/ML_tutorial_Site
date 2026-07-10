import type { SiteNavigationMenuId } from '../../data/navigationMenus.ts'

export interface RenderedNavigationLink {
  id: string
  route: string
  label: string
  active: boolean
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
  groups: RenderedNavigationGroup[]
}
