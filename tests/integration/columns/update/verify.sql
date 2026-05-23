DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Columns" WHERE "Id" = '00000000-0000-0000-0000-000000000020' AND "Title" = 'Updated To Do') THEN
        RAISE EXCEPTION 'Column title was not updated';
    END IF;
END $$;
