@echo off
mysql -u root -p < src/config/schema.sql
mysql -u root -p < src/db/migrations/update_restaurant_categories.sql 