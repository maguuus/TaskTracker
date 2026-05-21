DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "TaskItems" WHERE "Id" = '00000000-0000-0000-0000-000000000030' AND "Title" = 'CI Updated Task') THEN
        RAISE EXCEPTION 'Task title was not updated';
    END IF;
END $$;
