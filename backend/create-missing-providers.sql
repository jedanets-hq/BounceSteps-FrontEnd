-- Create missing service_provider records for users who have services

-- First, let's see what we have
SELECT 'Services with provider_id' as info;
SELECT DISTINCT provider_id, business_name FROM services WHERE provider_id IS NOT NULL;

SELECT 'Service providers' as info;
SELECT id, user_id, business_name FROM service_providers;

SELECT 'Users who are service providers' as info;
SELECT id, email, role FROM users WHERE role = 'service_provider';

-- Create service_provider records for users who have services but no provider record
INSERT INTO service_providers (user_id, business_name, created_at, updated_at)
SELECT DISTINCT 
  s.provider_id as user_id,
  COALESCE(s.business_name, 'Service Provider') as business_name,
  NOW() as created_at,
  NOW() as updated_at
FROM services s
WHERE s.provider_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM service_providers sp WHERE sp.user_id = s.provider_id
  )
ON CONFLICT (user_id) DO NOTHING;

-- Verify the fix
SELECT 'After fix - Service providers' as info;
SELECT id, user_id, business_name FROM service_providers;
