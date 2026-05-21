DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Columns" WHERE "Title" = 'CI Column') THEN
        RAISE EXCEPTION 'Column CI Column not found after create';
    END IF;
END $$;
