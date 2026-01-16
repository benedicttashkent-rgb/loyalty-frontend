-- Migration: Add telegram_chat_id column to customers table
-- Date: 2026-01-14
-- Description: Adds telegram_chat_id column to store Telegram chat IDs for broadcast functionality

-- Add telegram_chat_id column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Create index for faster queries on telegram_chat_id
CREATE INDEX IF NOT EXISTS idx_customers_telegram_chat_id 
ON customers(telegram_chat_id) 
WHERE telegram_chat_id IS NOT NULL;

-- Add comment to column
COMMENT ON COLUMN customers.telegram_chat_id IS 'Telegram chat ID for sending broadcasts. Retrieved from Telegram Web App initDataUnsafe.chat.id or user.id';
