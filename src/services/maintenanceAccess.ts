import { logError } from '@/lib/logger'
import { supabase } from '@/lib/supabase'

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
  /** Edge function could not be reached; access policy falls back to availability-first. */
  unavailable: boolean
}

const AVAILABILITY_FALLBACK: MaintenanceAccessSnapshot = {
  maintenance: false,
  bypass: true,
  unavailable: true,
}

export async function fetchMaintenanceAccess(): Promise<MaintenanceAccessSnapshot> {
  const { data, error } = await supabase.functions.invoke<MaintenanceAccessResponse>(
    'check-maintenance-access',
  )

  if (error) {
    logError('maintenanceAccess.invoke', error)
    return AVAILABILITY_FALLBACK
  }

  if (data?.success === false) {
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

export function isSiteAccessible(snapshot: MaintenanceAccessSnapshot): boolean {
  if (!snapshot.maintenance) return true
  return snapshot.bypass
}
