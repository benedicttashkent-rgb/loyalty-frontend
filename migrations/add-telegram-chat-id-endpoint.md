# Alternative: Add Migration Endpoint to Backend

If you can't access Railway Database Query, you can add a temporary migration endpoint to your backend.

## Add this to your backend API (temporary endpoint)

Create a file in your backend: `src/routes/admin/migrations.js`

```javascript
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Temporary migration endpoint
// Remove this after migration is complete!
router.post('/migrate/telegram-chat-id', async (req, res) => {
  try {
    // Verify admin authentication
    // Add your admin auth check here
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Add column
    await pool.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
    `);

    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_telegram_chat_id 
      ON customers(telegram_chat_id) 
      WHERE telegram_chat_id IS NOT NULL;
    `);

    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      AND column_name = 'telegram_chat_id';
    `);

    await pool.end();

    res.json({
      success: true,
      message: 'Migration completed successfully',
      column: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

Then call it:
```bash
curl -X POST https://your-railway-domain.up.railway.app/api/admin/migrate/telegram-chat-id \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
