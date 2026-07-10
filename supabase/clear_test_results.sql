-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- test_results currently holds leftover rows from development/testing
-- (1 row for clat-pg-mock-1, 5 for clat-pg-mock-2, 1 for clat-pg-mock-3).
-- Those rows make the report page's "Current Average/Best Score" labeling
-- look wrong, since any fresh attempt on those tests immediately becomes
-- the "2nd participant" instead of the first. This wipes the table so every
-- test starts from a clean slate.

truncate table public.test_results;
