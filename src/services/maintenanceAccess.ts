import { supabase } from '@/lib/supabase'

interface MaintenanceAccessResponse {
  success?: boolean
  maintenance?: boolean
  bypass?: boolean
}

export async function checkMaintenanceBypass(): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke<MaintenanceAccessResponse>(
    'check-maintenance-access',
    { method: 'GET' },
  )

  if (error) return false

  if (data?.maintenance === false) return true
  return Boolean(data?.bypass)
}
