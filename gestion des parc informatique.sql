SELECT
    r.id,
    m.asset_code,
    m.name AS material,
    u.first_name || ' ' || u.last_name AS technician,
    r.problem_description,
    r.status,
    r.start_date,
    r.end_date
FROM repairs r

JOIN materials m
    ON r.material_id = m.id

LEFT JOIN users u
    ON r.technician_id = u.id

ORDER BY r.start_date DESC;