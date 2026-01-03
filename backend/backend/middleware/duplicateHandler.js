/**
 * Middleware to handle MongoDB duplicate key errors
 */

const handleDuplicateKeyError = (error, req, res, next) => {
  // Check if it's a MongoDB duplicate key error
  if (error.code === 11000 || error.name === 'MongoServerError') {
    console.log('🔧 Handling duplicate key error:', error.message);
    
    // Extract field name from error
    let field = 'field';
    let value = 'value';
    
    if (error.keyValue) {
      field = Object.keys(error.keyValue)[0];
      value = error.keyValue[field];
    } else if (error.message) {
      // Parse error message for field info
      const match = error.message.match(/dup key: { (\w+): "([^"]+)" }/);
      if (match) {
        field = match[1];
        value = match[2];
      }
    }
    
    // Create user-friendly error message
    let message = 'This information is already registered.';
    
    if (field === 'email') {
      message = `An account with email "${value}" already exists. Please use a different email or try logging in.`;
    } else if (field === 'phone') {
      message = `This phone number is already registered. Please use a different phone number.`;
    } else if (field === 'google_id') {
      message = 'This Google account is already registered. Please try logging in.';
    }
    
    return res.status(400).json({
      success: false,
      message: message,
      field: field,
      code: 'DUPLICATE_KEY_ERROR'
    });
  }
  
  // If not a duplicate key error, pass to next error handler
  next(error);
};

module.exports = { handleDuplicateKeyError };
