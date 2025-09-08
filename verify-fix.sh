#!/bin/bash

echo "======================================"
echo "📊 DATABASE FIX VERIFICATION REPORT"
echo "======================================"
echo ""

export PGPASSWORD=secure_password_change_me

# 1. Check if database exists
echo "1. Database Status:"
psql -U pim_user -h localhost -p 5432 -l 2>/dev/null | grep pim_dev && echo "   ✅ Database 'pim_dev' exists" || echo "   ❌ Database not found"

# 2. Count tables
echo ""
echo "2. Tables Created:"
TABLE_COUNT=$(psql -U pim_user -h localhost -p 5432 -d pim_dev -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" 2>/dev/null || echo "0")
echo "   Total tables: $TABLE_COUNT"

# 3. List key tables
echo ""
echo "3. Key Tables:"
for table in products product_locales product_attributes product_media users categories; do
    EXISTS=$(psql -U pim_user -h localhost -p 5432 -d pim_dev -t -c "SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename='$table');" 2>/dev/null | tr -d ' ')
    if [ "$EXISTS" = "t" ]; then
        echo "   ✅ $table"
    else
        echo "   ❌ $table (missing)"
    fi
done

# 4. Check for problematic 'name' column in products
echo ""
echo "4. Schema Check:"
HAS_NAME=$(psql -U pim_user -h localhost -p 5432 -d pim_dev -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='name';" 2>/dev/null | tr -d ' \n')
if [ -z "$HAS_NAME" ]; then
    echo "   ✅ CORRECT: No 'name' column in products table"
else
    echo "   ❌ ERROR: 'name' column exists in products table!"
fi

# Check if name is in product_locales
HAS_LOCALE_NAME=$(psql -U pim_user -h localhost -p 5432 -d pim_dev -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='product_locales' AND column_name='name';" 2>/dev/null | tr -d ' \n')
if [ -n "$HAS_LOCALE_NAME" ]; then
    echo "   ✅ CORRECT: 'name' column exists in product_locales table"
else
    echo "   ❌ ERROR: 'name' column missing from product_locales table!"
fi

# 5. Data counts
echo ""
echo "5. Data Counts:"
PRODUCT_COUNT=$(psql -U pim_user -h localhost -p 5432 -d pim_dev -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
LOCALE_COUNT=$(psql -U pim_user -h localhost -p 5432 -d pim_dev -t -c "SELECT COUNT(*) FROM product_locales;" 2>/dev/null || echo "0")
USER_COUNT=$(psql -U pim_user -h localhost -p 5432 -d pim_dev -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

echo "   Products: $PRODUCT_COUNT"
echo "   Product Locales: $LOCALE_COUNT"
echo "   Users: $USER_COUNT"

# 6. Sample product data
echo ""
echo "6. Sample Products (if any):"
psql -U pim_user -h localhost -p 5432 -d pim_dev -c "SELECT p.sku, pl.name FROM products p LEFT JOIN product_locales pl ON p.id = pl.\"productId\" WHERE pl.\"localeCode\" = 'en' LIMIT 3;" 2>/dev/null || echo "   No products found"

echo ""
echo "======================================"
echo "📊 SUMMARY"
echo "======================================"

if [ "$TABLE_COUNT" -gt "0" ] && [ -z "$HAS_NAME" ] && [ -n "$HAS_LOCALE_NAME" ]; then
    echo "✅ SUCCESS: Database schema is CORRECT!"
    echo "   - Products table has NO 'name' column (correct)"
    echo "   - Product_locales table HAS 'name' column (correct)"
    echo ""
    if [ "$PRODUCT_COUNT" -gt "0" ]; then
        echo "✅ Data is seeded: $PRODUCT_COUNT products"
    else
        echo "⚠️  No data yet. Run: npm run seed"
    fi
else
    echo "❌ ISSUES DETECTED:"
    if [ "$TABLE_COUNT" -eq "0" ]; then
        echo "   - No tables created"
    fi
    if [ -n "$HAS_NAME" ]; then
        echo "   - 'name' column incorrectly in products table"
    fi
    if [ -z "$HAS_LOCALE_NAME" ]; then
        echo "   - 'name' column missing from product_locales table"
    fi
fi

echo ""
echo "======================================"
