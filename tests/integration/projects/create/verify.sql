DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Projects" WHERE "Name" = 'CI New Project') THEN
        RAISE EXCEPTION 'Project CI New Project not found after create';
    END IF;
END $$;
