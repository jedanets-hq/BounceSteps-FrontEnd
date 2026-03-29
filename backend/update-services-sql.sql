-- Fix existing services with "General" category
-- Update them to use their provider's first service category

UPDATE services s
SET category = (
  SELECT COALESCE(
    CASE 
      WHEN sp.service_categories IS NOT NULL AND sp.service_categories::text != '[]' 
      THEN (sp.service_categories::jsonb->0)::text
      ELSE 'Tours & Activities'
    END,
    'Tours & Activities'
  )
  FROM service_providers sp
  WHERE sp.user_id = s.provider_id
),
updated_at = CURRENT_TIMESTAMP
WHERE s.category = 'General' OR s.category ILIKE '%general%';

-- Show updated services
SELECT s.id, s.title, s.category, sp.business_name, sp.service_categories
FROM services s
INNER JOIN service_providers sp ON s.provider_id = sp.user_id
ORDER BY s.updated_at DESC
LIMIT 20;
