// PostgreSQL Helper Functions

/**
 * Convert pagination parameters to LIMIT/OFFSET
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return { offset, limit: parseInt(limit) };
};

/**
 * Serialize PostgreSQL row to JSON-friendly format
 */
const serializeDocument = (doc) => {
  if (!doc) return null;
  
  const obj = { ...doc };
  
  // Convert date fields to ISO strings
  ['created_at', 'updated_at', 'booking_date', 'featured_until', 'valid_from', 'valid_until', 'expires_at', 'started_at'].forEach(field => {
    if (obj[field] instanceof Date) {
      obj[field] = obj[field].toISOString();
    }
  });

  // Parse JSONB fields
  if (obj.location_data && typeof obj.location_data === 'string') {
    try {
      obj.location_data = JSON.parse(obj.location_data);
    } catch (e) {
      // Keep as string if parsing fails
    }
  }

  if (obj.data && typeof obj.data === 'string') {
    try {
      obj.data = JSON.parse(obj.data);
    } catch (e) {
      // Keep as string if parsing fails
    }
  }

  if (obj.media && typeof obj.media === 'string') {
    try {
      obj.media = JSON.parse(obj.media);
    } catch (e) {
      // Keep as string if parsing fails
    }
  }

  return obj;
};

/**
 * Serialize array of documents
 */
const serializeDocuments = (docs) => {
  return docs.map(serializeDocument);
};

/**
 * Check if value is valid integer ID
 */
const isValidObjectId = (id) => {
  return /^\d+$/.test(String(id));
};

/**
 * Convert to integer ID
 */
const toObjectId = (id) => {
  const intId = parseInt(id);
  if (isNaN(intId)) {
    throw new Error('Invalid ID');
  }
  return intId;
};

/**
 * Pagination response helper
 */
const paginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data: serializeDocuments(data),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Build service filter for PostgreSQL
 */
const buildServiceFilter = (query) => {
  const conditions = [];
  const values = [];
  let paramCount = 1;

  conditions.push(`is_active = $${paramCount}`);
  values.push(true);
  paramCount++;

  if (query.category) {
    conditions.push(`category = $${paramCount}`);
    values.push(query.category);
    paramCount++;
  }

  if (query.location) {
    conditions.push(`location ILIKE $${paramCount}`);
    values.push(`%${query.location}%`);
    paramCount++;
  }

  if (query.country) {
    conditions.push(`country = $${paramCount}`);
    values.push(query.country);
    paramCount++;
  }

  if (query.region) {
    conditions.push(`region = $${paramCount}`);
    values.push(query.region);
    paramCount++;
  }

  if (query.district) {
    conditions.push(`district = $${paramCount}`);
    values.push(query.district);
    paramCount++;
  }

  if (query.minPrice) {
    conditions.push(`price >= $${paramCount}`);
    values.push(parseFloat(query.minPrice));
    paramCount++;
  }

  if (query.maxPrice) {
    conditions.push(`price <= $${paramCount}`);
    values.push(parseFloat(query.maxPrice));
    paramCount++;
  }

  if (query.search) {
    conditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR category ILIKE $${paramCount})`);
    values.push(`%${query.search}%`);
    paramCount++;
  }

  return { conditions, values, paramCount };
};

/**
 * Build sort clause for PostgreSQL
 */
const buildSort = (sortBy, sortOrder = 'desc') => {
  const sortMap = {
    'price': `price ${sortOrder.toUpperCase()}`,
    'rating': 'average_rating DESC',
    'popular': 'bookings_count DESC',
    'newest': 'created_at DESC',
    'created_at': 'created_at DESC'
  };

  return sortMap[sortBy] || sortMap['created_at'];
};

module.exports = {
  getPagination,
  buildServiceFilter,
  buildSort,
  serializeDocument,
  serializeDocuments,
  isValidObjectId,
  toObjectId,
  paginationResponse
};