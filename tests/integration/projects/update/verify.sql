DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Projects" WHERE "Id" = '00000000-0000-0000-0000-000000000010' AND "Name" = 'CI Updated Project') THEN
        RAISE EXCEPTION 'Project name was not updated';
    END IF;
END $$;
