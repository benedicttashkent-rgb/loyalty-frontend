/**
 * Migration Script: Add telegram_chat_id column to customers table
 * 
 * Run this via Railway:
 * Railway Dashboard → API Service → Settings → Deploy → Run Command
 * Command: node migrations/run-migration.js
 * 
 * Or via terminal:
 * node migrations/run-migration.js
 */

const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('📝 Running migration: Add telegram_chat_id column...');
    
    // Add telegram_chat_id column
    await client.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
    `);
    console.log('✅ Added telegram_chat_id column');

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_telegram_chat_id 
      ON customers(telegram_chat_id) 
      WHERE telegram_chat_id IS NOT NULL;
    `);
    console.log('✅ Created index on telegram_chat_id');

    // Verify the column exists
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      AND column_name = 'telegram_chat_id';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Migration successful!');
      console.log('   Column details:', result.rows[0]);
      
      // Count customers with telegram_chat_id
      const countResult = await client.query(`
        SELECT COUNT(*) as total,
               COUNT(telegram_chat_id) as with_telegram
        FROM customers;
      `);
      console.log('📊 Customer stats:');
      console.log(`   Total customers: ${countResult.rows[0].total}`);
      console.log(`   With telegram_chat_id: ${countResult.rows[0].with_telegram}`);
    } else {
      console.error('❌ Column was not created!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
