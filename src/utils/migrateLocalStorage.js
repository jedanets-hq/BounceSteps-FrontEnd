/**
 * Utility to migrate localStorage data to PostgreSQL database
 * This runs automatically when a user logs in
 */

import { cartAPI, plansAPI, favoritesAPI } from './api';

export const migrateLocalStorageToDatabase = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
    
    if (!user.token) {
      console.log('⚠️ User not authenticated, skipping migration');
      return;
    }

    console.log('🔄 Starting localStorage to database migration...');

    // Migrate cart items
    await migrateCart();

    // Migrate trip plans
    await migratePlans();

    // Migrate favorites
    await migrateFavorites();

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

const migrateCart = async () => {
  try {
    const savedCart = localStorage.getItem('isafari_cart');
    if (!savedCart) {
      console.log('ℹ️ No cart data to migrate');
      return;
    }

    const cartItems = JSON.parse(savedCart);
    console.log(`📦 Migrating ${cartItems.length} cart items...`);

    for (const item of cartItems) {
      try {
        await cartAPI.addToCart(item.id || item.service_id, item.quantity || 1);
      } catch (error) {
        console.error(`❌ Error migrating cart item ${item.id}:`, error);
      }
    }

    console.log('✅ Cart migration completed');
    // Keep localStorage as backup for now
    // localStorage.removeItem('isafari_cart');
  } catch (error) {
    console.error('❌ Cart migration error:', error);
  }
};

const migratePlans = async () => {
  try {
    const savedPlans = localStorage.getItem('trip_plans');
    if (!savedPlans) {
      console.log('ℹ️ No plans data to migrate');
      return;
    }

    const plans = JSON.parse(savedPlans);
    console.log(`📅 Migrating ${plans.length} trip plans...`);

    for (const plan of plans) {
      try {
        await plansAPI.addToPlan(
          plan.id || plan.service_id,
          plan.plan_date || null,
          plan.notes || null
        );
      } catch (error) {
        console.error(`❌ Error migrating plan ${plan.id}:`, error);
      }
    }

    console.log('✅ Plans migration completed');
    // Keep localStorage as backup for now
    // localStorage.removeItem('trip_plans');
  } catch (error) {
    console.error('❌ Plans migration error:', error);
  }
};

const migrateFavorites = async () => {
  try {
    const savedFavorites = localStorage.getItem('favorite_providers');
    if (!savedFavorites) {
      console.log('ℹ️ No favorites data to migrate');
      return;
    }

    const favorites = JSON.parse(savedFavorites);
    console.log(`⭐ Migrating ${favorites.length} favorite providers...`);

    for (const favorite of favorites) {
      try {
        await favoritesAPI.addToFavorites(favorite.id || favorite.provider_id);
      } catch (error) {
        console.error(`❌ Error migrating favorite ${favorite.id}:`, error);
      }
    }

    console.log('✅ Favorites migration completed');
    // Keep localStorage as backup for now
    // localStorage.removeItem('favorite_providers');
  } catch (error) {
    console.error('❌ Favorites migration error:', error);
  }
};

export default migrateLocalStorageToDatabase;
