// Accommodation and Transport Data by Region

export const accommodations = {
  'Arusha': {
    hotels: [
      { id: 1, name: 'Four Points by Sheraton Arusha', location: 'Arusha Urban', price: 180, rating: 4.5, facilities: ['wifi', 'pool', 'restaurant', 'gym', 'parking'] },
      { id: 2, name: 'Arusha Coffee Lodge', location: 'Arusha Rural', price: 250, rating: 4.8, facilities: ['wifi', 'pool', 'restaurant', 'spa'] },
      { id: 3, name: 'Mount Meru Hotel', location: 'Arusha Urban', price: 150, rating: 4.3, facilities: ['wifi', 'pool', 'restaurant', 'parking'] },
      { id: 4, name: 'Gran Melia Arusha', location: 'Arusha Urban', price: 280, rating: 4.9, facilities: ['wifi', 'pool', 'restaurant', 'gym', 'spa', 'parking'] },
      { id: 5, name: 'Arusha Planet Lodge', location: 'Arusha Urban', price: 120, rating: 4.2, facilities: ['wifi', 'restaurant', 'parking'] }
    ],
    guesthouses: [
      { id: 6, name: 'Outpost Lodge', location: 'Arusha Urban', price: 60, rating: 4.4, facilities: ['wifi', 'breakfast'] },
      { id: 7, name: 'Masai Camp', location: 'Arusha Rural', price: 45, rating: 4.0, facilities: ['wifi', 'breakfast', 'parking'] },
      { id: 8, name: 'Arusha Backpackers', location: 'Arusha Urban', price: 35, rating: 3.9, facilities: ['wifi'] },
      { id: 9, name: 'Green Mountain Hotel', location: 'Arusha Urban', price: 55, rating: 4.1, facilities: ['wifi', 'breakfast', 'restaurant'] }
    ],
    lodges: [
      { id: 10, name: 'Serengeti Serena Safari Lodge', location: 'Ngorongoro', price: 350, rating: 4.9, facilities: ['wifi', 'pool', 'restaurant', 'spa'] },
      { id: 11, name: 'Ngorongoro Crater Lodge', location: 'Ngorongoro', price: 450, rating: 5.0, facilities: ['wifi', 'restaurant', 'spa', 'butler'] },
      { id: 12, name: 'Tarangire Safari Lodge', location: 'Karatu', price: 280, rating: 4.7, facilities: ['wifi', 'pool', 'restaurant'] }
    ],
    resorts: [
      { id: 13, name: 'Arusha Serena Hotel', location: 'Arusha Urban', price: 220, rating: 4.6, facilities: ['wifi', 'pool', 'restaurant', 'gym', 'spa'] },
      { id: 14, name: 'Rivertrees Country Inn', location: 'Arusha Rural', price: 200, rating: 4.7, facilities: ['wifi', 'pool', 'restaurant', 'spa'] }
    ]
  },
  'Dar es Salaam': {
    hotels: [
      { id: 15, name: 'Hyatt Regency Dar es Salaam', location: 'Ilala', price: 200, rating: 4.6, facilities: ['wifi', 'pool', 'restaurant', 'gym', 'spa'] },
      { id: 16, name: 'Sea Cliff Hotel', location: 'Kinondoni', price: 180, rating: 4.5, facilities: ['wifi', 'pool', 'restaurant', 'gym'] },
      { id: 17, name: 'Ramada Resort', location: 'Kigamboni', price: 150, rating: 4.3, facilities: ['wifi', 'pool', 'restaurant', 'beach'] },
      { id: 18, name: 'Protea Hotel', location: 'Ilala', price: 140, rating: 4.2, facilities: ['wifi', 'pool', 'restaurant'] },
      { id: 19, name: 'Southern Sun Hotel', location: 'Kinondoni', price: 160, rating: 4.4, facilities: ['wifi', 'pool', 'restaurant', 'gym'] }
    ],
    guesthouses: [
      { id: 20, name: 'Karibu Beach Hotel', location: 'Temeke', price: 50, rating: 4.0, facilities: ['wifi', 'breakfast'] },
      { id: 21, name: 'Mikadi Beach Guest House', location: 'Kigamboni', price: 45, rating: 3.9, facilities: ['wifi', 'beach'] },
      { id: 22, name: 'Slipway Apartments', location: 'Kinondoni', price: 70, rating: 4.2, facilities: ['wifi', 'parking'] }
    ],
    apartments: [
      { id: 23, name: 'Masaki Apartments', location: 'Kinondoni', price: 90, rating: 4.3, facilities: ['wifi', 'ac', 'parking'] },
      { id: 24, name: 'Oyster Bay Residences', location: 'Kinondoni', price: 120, rating: 4.5, facilities: ['wifi', 'pool', 'gym', 'parking'] }
    ]
  },
  'Zanzibar': {
    hotels: [
      { id: 25, name: 'Park Hyatt Zanzibar', location: 'Mjini Magharibi', price: 300, rating: 4.8, facilities: ['wifi', 'pool', 'restaurant', 'spa', 'beach'] },
      { id: 26, name: 'Zanzibar Serena Hotel', location: 'Mjini Magharibi', price: 250, rating: 4.7, facilities: ['wifi', 'pool', 'restaurant', 'spa'] },
      { id: 27, name: 'Tembo House Hotel', location: 'Mjini Magharibi', price: 180, rating: 4.5, facilities: ['wifi', 'restaurant', 'beach'] },
      { id: 28, name: 'DoubleTree by Hilton', location: 'Mjini Magharibi', price: 220, rating: 4.6, facilities: ['wifi', 'pool', 'restaurant', 'gym'] }
    ],
    resorts: [
      { id: 29, name: 'Zuri Zanzibar', location: 'Kaskazini A', price: 350, rating: 4.9, facilities: ['wifi', 'pool', 'restaurant', 'spa', 'beach', 'watersports'] },
      { id: 30, name: 'The Residence Zanzibar', location: 'Kusini', price: 400, rating: 5.0, facilities: ['wifi', 'pool', 'restaurant', 'spa', 'beach', 'butler'] },
      { id: 31, name: 'Baraza Resort', location: 'Kusini', price: 380, rating: 4.9, facilities: ['wifi', 'pool', 'restaurant', 'spa', 'beach'] },
      { id: 32, name: 'Melia Zanzibar', location: 'Kaskazini A', price: 320, rating: 4.8, facilities: ['wifi', 'pool', 'restaurant', 'spa', 'beach'] }
    ],
    guesthouses: [
      { id: 33, name: 'Emerson Spice', location: 'Mjini Magharibi', price: 150, rating: 4.6, facilities: ['wifi', 'restaurant', 'rooftop'] },
      { id: 34, name: 'Dhow Palace Hotel', location: 'Mjini Magharibi', price: 120, rating: 4.4, facilities: ['wifi', 'restaurant'] },
      { id: 35, name: 'Zanzibar Palace Hotel', location: 'Mjini Magharibi', price: 140, rating: 4.5, facilities: ['wifi', 'pool', 'restaurant'] }
    ]
  },
  'Kilimanjaro': {
    hotels: [
      { id: 36, name: 'Kilimanjaro Crane Hotel', location: 'Moshi Urban', price: 100, rating: 4.2, facilities: ['wifi', 'restaurant', 'parking'] },
      { id: 37, name: 'Sal Salinero Hotel', location: 'Moshi Urban', price: 90, rating: 4.0, facilities: ['wifi', 'restaurant'] },
      { id: 38, name: 'Bristol Cottages', location: 'Moshi Urban', price: 110, rating: 4.3, facilities: ['wifi', 'pool', 'restaurant'] }
    ],
    lodges: [
      { id: 39, name: 'Kilimanjaro Mountain Resort', location: 'Moshi Rural', price: 200, rating: 4.7, facilities: ['wifi', 'pool', 'restaurant', 'spa'] },
      { id: 40, name: 'Marangu Hotel', location: 'Moshi Rural', price: 150, rating: 4.5, facilities: ['wifi', 'restaurant', 'garden'] },
      { id: 41, name: 'Kibo Palace Hotel', location: 'Moshi Urban', price: 130, rating: 4.4, facilities: ['wifi', 'pool', 'restaurant'] }
    ],
    guesthouses: [
      { id: 42, name: 'Kilimanjaro Backpackers', location: 'Moshi Urban', price: 40, rating: 3.9, facilities: ['wifi', 'breakfast'] },
      { id: 43, name: 'Honey Badger Lodge', location: 'Moshi Urban', price: 50, rating: 4.1, facilities: ['wifi', 'breakfast', 'garden'] }
    ]
  },
  'Mwanza': {
    hotels: [
      { id: 44, name: 'Hotel Tilapia', location: 'Ilemela', price: 120, rating: 4.3, facilities: ['wifi', 'pool', 'restaurant', 'beach'] },
      { id: 45, name: 'Malaika Beach Resort', location: 'Ilemela', price: 100, rating: 4.1, facilities: ['wifi', 'restaurant', 'beach'] },
      { id: 46, name: 'Tunza Lodge', location: 'Nyamagana', price: 80, rating: 4.0, facilities: ['wifi', 'restaurant'] }
    ],
    guesthouses: [
      { id: 47, name: 'Rock Beach Hotel', location: 'Ilemela', price: 60, rating: 3.9, facilities: ['wifi', 'beach'] },
      { id: 48, name: 'Lake View Hotel', location: 'Nyamagana', price: 55, rating: 3.8, facilities: ['wifi', 'restaurant'] }
    ]
  }
};

export const transportServices = {
  'Arusha': [
    { id: 1, name: 'Arusha Car Rentals', type: 'rental-car', vehicles: ['4x4 Safari', 'SUV', 'Sedan'], pricePerDay: 80, rating: 4.5 },
    { id: 2, name: 'Safari Drive Tanzania', type: 'private-driver', vehicles: ['4x4 with Driver', 'Land Cruiser'], pricePerDay: 150, rating: 4.7 },
    { id: 3, name: 'Kilimanjaro Express', type: 'bus', routes: ['Arusha-Dar', 'Arusha-Moshi'], pricePerDay: 30, rating: 4.2 },
    { id: 4, name: 'Precision Air', type: 'flight', routes: ['Arusha-Dar', 'Arusha-Zanzibar'], pricePerDay: 200, rating: 4.6 },
    { id: 5, name: 'Easy Travel', type: 'private-driver', vehicles: ['Safari Van', 'Minibus'], pricePerDay: 120, rating: 4.4 }
  ],
  'Dar es Salaam': [
    { id: 6, name: 'Dar Car Hire', type: 'rental-car', vehicles: ['Sedan', 'SUV', 'Van'], pricePerDay: 60, rating: 4.3 },
    { id: 7, name: 'Uber Dar', type: 'private-driver', vehicles: ['Sedan', 'SUV'], pricePerDay: 100, rating: 4.5 },
    { id: 8, name: 'Dar Express Bus', type: 'bus', routes: ['Dar-Arusha', 'Dar-Mwanza'], pricePerDay: 25, rating: 4.0 },
    { id: 9, name: 'Coastal Aviation', type: 'flight', routes: ['Dar-Zanzibar', 'Dar-Selous'], pricePerDay: 150, rating: 4.7 },
    { id: 10, name: 'Tanzania Railways', type: 'train', routes: ['Dar-Mwanza', 'Dar-Kigoma'], pricePerDay: 50, rating: 3.8 }
  ],
  'Zanzibar': [
    { id: 11, name: 'Zanzibar Car Rental', type: 'rental-car', vehicles: ['Scooter', 'Car', 'Bicycle'], pricePerDay: 40, rating: 4.2 },
    { id: 12, name: 'Island Tours Zanzibar', type: 'private-driver', vehicles: ['Car with Driver', 'Van'], pricePerDay: 80, rating: 4.6 },
    { id: 13, name: 'Azam Marine', type: 'ferry', routes: ['Zanzibar-Dar', 'Zanzibar-Pemba'], pricePerDay: 35, rating: 4.4 },
    { id: 14, name: 'ZanAir', type: 'flight', routes: ['Zanzibar-Dar', 'Zanzibar-Arusha'], pricePerDay: 180, rating: 4.5 }
  ],
  'Kilimanjaro': [
    { id: 15, name: 'Moshi Car Rentals', type: 'rental-car', vehicles: ['4x4', 'SUV'], pricePerDay: 70, rating: 4.3 },
    { id: 16, name: 'Kilimanjaro Drivers', type: 'private-driver', vehicles: ['4x4 with Driver'], pricePerDay: 130, rating: 4.6 },
    { id: 17, name: 'Moshi Express', type: 'bus', routes: ['Moshi-Arusha', 'Moshi-Dar'], pricePerDay: 20, rating: 4.1 }
  ],
  'Mwanza': [
    { id: 18, name: 'Mwanza Car Hire', type: 'rental-car', vehicles: ['Sedan', 'SUV'], pricePerDay: 65, rating: 4.2 },
    { id: 19, name: 'Lake Victoria Transport', type: 'private-driver', vehicles: ['Car', 'Van'], pricePerDay: 110, rating: 4.4 },
    { id: 20, name: 'Mwanza Bus Service', type: 'bus', routes: ['Mwanza-Dar', 'Mwanza-Arusha'], pricePerDay: 30, rating: 3.9 }
  ]
};

export const getAccommodationsByType = (region, type) => {
  const regionData = accommodations[region];
  if (!regionData) return [];
  
  switch(type) {
    case 'hotel':
      return regionData.hotels || [];
    case 'guesthouse':
      return regionData.guesthouses || [];
    case 'apartment':
      return regionData.apartments || [];
    case 'resort':
      return regionData.resorts || [];
    case 'lodge':
      return regionData.lodges || [];
    default:
      return Object.values(regionData).flat();
  }
};

export const getTransportByRegion = (region) => {
  return transportServices[region] || [];
};

export default { accommodations, transportServices, getAccommodationsByType, getTransportByRegion };
