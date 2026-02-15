-- Migration: Add VAT fields to pyc and pyc_detail tables
-- Created: 2026-02-11

-- ============================================
-- 1. Add VAT fields to PYC header (default values for the entire request)
-- ============================================

-- Add vat_display column to pyc header (default VAT for all items)
ALTER TABLE pyc 
ADD COLUMN IF NOT EXISTS vat_display TEXT DEFAULT '10%';

-- Add vat_value column to pyc header (default VAT rate for all items)
ALTER TABLE pyc 
ADD COLUMN IF NOT EXISTS vat_value NUMERIC(5, 2) DEFAULT 0.1;

-- Add comments
COMMENT ON COLUMN pyc.vat_display IS 'Default VAT display label for all items in this request';
COMMENT ON COLUMN pyc.vat_value IS 'Default VAT numeric value for all items in this request';

-- ============================================
-- 2. Add VAT fields to PYC_Detail (can override header default)
-- ============================================

-- Add vat_display column to store the display label (5%, 8%, 10%, etc.)
ALTER TABLE pyc_detail 
ADD COLUMN IF NOT EXISTS vat_display TEXT;

-- Add vat_value column to store the numeric VAT rate (0.05, 0.08, 0.1, etc.)
ALTER TABLE pyc_detail 
ADD COLUMN IF NOT EXISTS vat_value NUMERIC(5, 2);

-- Add comment for documentation
COMMENT ON COLUMN pyc_detail.vat_display IS 'VAT display label: 5%, 8%, 10%, Không chịu thuế, Khác (inherits from pyc.vat_display by default)';
COMMENT ON COLUMN pyc_detail.vat_value IS 'VAT numeric value: 0.05, 0.08, 0.1, 0, 0 (inherits from pyc.vat_value by default)';

-- Note: The vatStatus column already exists and can be repurposed or kept as is
-- If you want to rename it, uncomment the following line:
-- ALTER TABLE pyc_detail RENAME COLUMN vat_status TO vat_display;
