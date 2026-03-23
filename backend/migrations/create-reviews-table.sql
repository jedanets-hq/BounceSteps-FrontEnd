-- Create reviews table for service ratings
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, user_id, booking_id) -- One review per booking
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Function to update service average_rating
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
  )
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update service rating
DROP TRIGGER IF EXISTS trigger_update_service_rating ON reviews;
CREATE TRIGGER trigger_update_service_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_service_rating();

-- Function to update provider rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_providers
  SET rating = (
    SELECT COALESCE(AVG(r.rating), 0)
    FROM reviews r
    JOIN services s ON r.service_id = s.id
    WHERE s.provider_id = (
      SELECT provider_id FROM services WHERE id = COALESCE(NEW.service_id, OLD.service_id)
    )
  )
  WHERE id = (
    SELECT provider_id FROM services WHERE id = COALESCE(NEW.service_id, OLD.service_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update provider rating
DROP TRIGGER IF EXISTS trigger_update_provider_rating ON reviews;
CREATE TRIGGER trigger_update_provider_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();
