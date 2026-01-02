-- Multi-Trip Journeys Table
-- Stores journey plans with multiple destinations

CREATE TABLE IF NOT EXISTS multi_trip_journeys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    journey_name VARCHAR(255),
    total_destinations INTEGER DEFAULT 1,
    start_date DATE,
    end_date DATE,
    travelers INTEGER DEFAULT 1,
    budget VARCHAR(50),
    total_cost DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Trip Destinations Table
-- Stores each destination in a multi-trip journey
CREATE TABLE IF NOT EXISTS multi_trip_destinations (
    id SERIAL PRIMARY KEY,
    journey_id INTEGER REFERENCES multi_trip_journeys(id) ON DELETE CASCADE NOT NULL,
    destination_order INTEGER NOT NULL,
    country VARCHAR(100),
    region VARCHAR(100),
    district VARCHAR(100),
    sublocation VARCHAR(100),
    is_starting_point BOOLEAN DEFAULT FALSE,
    is_ending_point BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Trip Services Table
-- Stores selected services for each destination
CREATE TABLE IF NOT EXISTS multi_trip_services (
    id SERIAL PRIMARY KEY,
    journey_id INTEGER REFERENCES multi_trip_journeys(id) ON DELETE CASCADE NOT NULL,
    destination_id INTEGER REFERENCES multi_trip_destinations(id) ON DELETE CASCADE NOT NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(12, 2),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(journey_id, destination_id, service_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_multi_trip_journeys_user_id ON multi_trip_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_trip_journeys_status ON multi_trip_journeys(status);
CREATE INDEX IF NOT EXISTS idx_multi_trip_destinations_journey_id ON multi_trip_destinations(journey_id);
CREATE INDEX IF NOT EXISTS idx_multi_trip_destinations_order ON multi_trip_destinations(destination_order);
CREATE INDEX IF NOT EXISTS idx_multi_trip_services_journey_id ON multi_trip_services(journey_id);
CREATE INDEX IF NOT EXISTS idx_multi_trip_services_destination_id ON multi_trip_services(destination_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_multi_trip_journeys_updated_at ON multi_trip_journeys;
CREATE TRIGGER update_multi_trip_journeys_updated_at 
    BEFORE UPDATE ON multi_trip_journeys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
