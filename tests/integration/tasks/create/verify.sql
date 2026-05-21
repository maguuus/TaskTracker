DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "TaskItems" WHERE "Title" = 'CI New Task') THEN
        RAISE EXCEPTION 'Task CI New Task not found after create';
    END IF;
END $$;
