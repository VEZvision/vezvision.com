import { logError } from '@/lib/logger'
import { getApiClient } from '@/lib/api'

interface MaintenanceAccessResponse {
  success?: boolean
  maintenance?: boolean
  bypass?: boolean
}

export interface MaintenanceAccessSnapshot {
  /** Authoritative flag from vv_site_settings via edge. */
  maintenance: boolean
  /** Whether the current visitor may use the public site during maintenance. */
  bypass: boolean
  /** Edge function could not be reached; combine with a fresh DB read for fail-closed decisions. */
  unavailable: boolean
}

const AVAILABILITY_FALLBACK: MaintenanceAccessSnapshot = {
  maintenance: false,
  bypass: true,
  unavailable: true,
}

export async function fetchMaintenanceEnabledFromDb(): Promise<boolean | null> {
  const api = getApiClient()
  const { data, error } = await api
    .from('vv_site_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .eq('is_public', true)
    .maybeSingle()

  if (error) {
    logError('maintenanceAccess.db', error)
    return null
  }

  const settings = data?.value as { enabled?: boolean } | null
  return settings?.enabled === true
}

export async function fetchMaintenanceAccess(): Promise<MaintenanceAccessSnapshot> {
  const response = await getApiClient().invoke<MaintenanceAccessResponse>('check-maintenance-access')

  if (response.error) {
    logError('maintenanceAccess.invoke', response.error)
    return AVAILABILITY_FALLBACK
  }

  const data = response.data

  if (data?.success === false) {
    if (data?.maintenance === true) {
      return {
        maintenance: true,
        bypass: Boolean(data?.bypass),
        unavailable: false,
      }
    }

    logError('maintenanceAccess.response', new Error('check-maintenance-access returned success=false'))
    return AVAILABILITY_FALLBACK
  }

  if (data?.maintenance !== true) {
    return { maintenance: false, bypass: true, unavailable: false }
  }

  return {
    maintenance: true,
    bypass: Boolean(data?.bypass),
    unavailable: false,
  }
}

/**
 * @param settingsMaintenanceEnabled CMS flag from cached settings — when edge is down but
 * maintenance is enabled in CMS, fail closed so a half-deployed site stays protected.
 */
export function isSiteAccessible(
  snapshot: MaintenanceAccessSnapshot,
  settingsMaintenanceEnabled = false,
  dbMaintenanceEnabled: boolean | null = null,
): boolean {
  if (snapshot.unavailable) {
    if (settingsMaintenanceEnabled) return false
    if (dbMaintenanceEnabled === true) return false
    if (dbMaintenanceEnabled === null) return false
    return true
  }

  if (!snapshot.maintenance) return true
  return snapshot.bypass
}
