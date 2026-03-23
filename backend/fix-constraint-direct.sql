-- Drop all promotion_type constraints
ALTER TABLE promotion_payments DROP CONSTRAINT IF EXISTS promotion_payments_promotion_type_check CASCADE;

-- Add new constraint with correct values
ALTER TABLE promotion_payments 
ADD CONSTRAINT promotion_payments_promotion_type_check 
CHECK (promotion_type IN ('verification', 'featured_listing', 'premium_badge', 'top_placement'));

-- Verify
SELECT 
  conname as constraint_name, 
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'promotion_payments'::regclass
  AND conname LIKE '%promotion_type%';
