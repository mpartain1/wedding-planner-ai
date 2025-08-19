import { VendorService } from '../services/vendorService';
import { AIEmailService } from '../services/aiEmailService';

export async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test 1: Fetch categories
    console.log('1. Fetching categories...');
    const categories = await VendorService.getCategories();
    console.log(`✅ Found ${categories.length} categories`);
    
    // Test 2: Add a test vendor
    if (categories.length > 0) {
      console.log('2. Adding test vendor...');
      const testVendor = await VendorService.addVendor({
        category_id: categories[0].id,
        name: 'Test Vendor',
        contact_email: 'test@example.com',
        phone: '(555) 000-0000',
        price: 1000,
        status: 'uncontacted',
        last_contact: new Date().toISOString().split('T')[0],
        notes: 'Test vendor - please delete',
      });
      console.log('✅ Test vendor added:', testVendor.id);
      
      // Test 3: Send AI email
      console.log('3. Testing AI email service...');
      await AIEmailService.sendInitialOutreach(testVendor.id);
      console.log('✅ AI email service working');
      
      // Test 4: Clean up
      console.log('4. Cleaning up test data...');
      await VendorService.deleteVendor(testVendor.id);
      console.log('✅ Test vendor deleted');
    }
    
    console.log('🎉 All database tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Run this in browser console: testDatabaseConnection()
(window as any).testDb = testDatabaseConnection;