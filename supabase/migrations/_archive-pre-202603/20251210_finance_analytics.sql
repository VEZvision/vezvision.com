-- Add additional_costs to internal_projects
ALTER TABLE internal_projects 
ADD COLUMN IF NOT EXISTS additional_costs JSONB DEFAULT '{}'::jsonb;
-- Example structure: {"servers": 100, "commissions": 500, "licenses": 200}

-- View: Project Financials (Live Margin)
CREATE OR REPLACE VIEW project_financials AS
WITH labor_costs AS (
    SELECT 
        p.id AS project_id,
        COALESCE(SUM(te.duration_minutes::numeric / 60.0 * tm.hourly_rate), 0) AS total_labor_cost
    FROM internal_projects p
    LEFT JOIN time_entries te ON p.id = te.project_id
    LEFT JOIN team_members tm ON te.team_member_id = tm.id
    GROUP BY p.id
),
additional_costs_calc AS (
    -- Summing up numeric values from the jsonb map (simple key-value assumption)
    SELECT 
        id AS project_id,
        COALESCE((
            SELECT SUM(value::numeric) 
            FROM jsonb_each_text(additional_costs) 
        ), 0) AS total_additional_cost
    FROM internal_projects
)
SELECT 
    p.id AS project_id,
    p.name,
    p.status,
    p.deadline,
    p.budget_total,
    lc.total_labor_cost,
    ac.total_additional_cost,
    (lc.total_labor_cost + ac.total_additional_cost) AS total_spent,
    (p.budget_total - (lc.total_labor_cost + ac.total_additional_cost)) AS net_margin,
    CASE 
        WHEN p.budget_total IS NULL OR p.budget_total = 0 THEN 0
        ELSE ROUND(((p.budget_total - (lc.total_labor_cost + ac.total_additional_cost)) / p.budget_total * 100), 2)
    END AS margin_percentage
FROM internal_projects p
LEFT JOIN labor_costs lc ON p.id = lc.project_id
LEFT JOIN additional_costs_calc ac ON p.id = ac.project_id;

-- View: Employee Profitability
-- (Simplified: Revenue Generated = Billable Hours * Hourly Rate)
CREATE OR REPLACE VIEW employee_stats AS
SELECT 
    tm.id AS team_member_id,
    tm.full_name,
    tm.role,
    tm.hourly_rate,
    COALESCE(SUM(te.duration_minutes::numeric / 60.0), 0) AS total_hours_logged,
    COALESCE(SUM(CASE WHEN te.billable THEN te.duration_minutes::numeric / 60.0 ELSE 0 END), 0) AS total_billable_hours,
    COALESCE(SUM(CASE WHEN te.billable THEN (te.duration_minutes::numeric / 60.0 * tm.hourly_rate) ELSE 0 END), 0) AS estimated_revenue_generated
FROM team_members tm
LEFT JOIN time_entries te ON tm.id = te.team_member_id
GROUP BY tm.id, tm.full_name, tm.role, tm.hourly_rate;
