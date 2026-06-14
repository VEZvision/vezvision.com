import { useSettingsContext } from '@/contexts/SettingsContext'

export function useSocial() {
  const { social } = useSettingsContext()
  return social
}

export function useNavigation() {
  const { navigation } = useSettingsContext()
  return navigation
}

export function useIdentity() {
  const { identity } = useSettingsContext()
  return identity
}

export function useFooter() {
  const { footer } = useSettingsContext()
  return footer
}

export function useContact() {
  const { contact } = useSettingsContext()
  return contact
}

export function useSeo() {
  const { seo } = useSettingsContext()
  return seo
}

export function useMaintenance() {
  const { maintenance } = useSettingsContext()
  return maintenance
}

export { useSettingsContext as useSettings }
