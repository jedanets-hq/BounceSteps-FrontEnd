// Test if cart routes can be loaded
console.log('🧪 Testing cart routes module loading...\n');

try {
  const cartRoutes = require('./routes/cart');
  console.log('✅ Cart routes loaded successfully');
  console.log('Routes object type:', typeof cartRoutes);
  console.log('Is Express Router:', cartRoutes && typeof cartRoutes.stack !== 'undefined');
  
  if (cartRoutes && cartRoutes.stack) {
    console.log('\nRegistered routes:');
    cartRoutes.stack.forEach((layer, index) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        console.log(`  ${index + 1}. ${methods} ${layer.route.path}`);
      }
    });
  }
} catch (error) {
  console.error('❌ Error loading cart routes:');
  console.error('Message:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
}
