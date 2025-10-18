-- SQL Commands to Set Admin Access
-- Execute these in your database UI (Neon, pgAdmin, or similar)

-- 1. Set specific user as admin by email
UPDATE "User" 
SET "isAdmin" = true 
WHERE email = 'amritanshurai04@gmail.com';

-- Alternative: Set admin by user ID
-- UPDATE "User" 
-- SET "isAdmin" = true 
-- WHERE id = 'cmgwkxvhd00002uq7ceyud5rt';

-- 2. View all admin users
SELECT id, email, name, "isAdmin", "createdAt"
FROM "User"
WHERE "isAdmin" = true;

-- 3. View all users with their admin status
SELECT id, email, name, "isAdmin", "profileCompleted", "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;

-- 4. Remove admin access from a user
-- UPDATE "User" 
-- SET "isAdmin" = false 
-- WHERE email = 'user@example.com';

-- 5. Count admin users
SELECT COUNT(*) as admin_count
FROM "User"
WHERE "isAdmin" = true;
