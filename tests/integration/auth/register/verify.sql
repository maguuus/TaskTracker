DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Users" WHERE "Email" = 'ci-register@test.com') THEN
        RAISE EXCEPTION 'User ci-register@test.com not found after register';
    END IF;
END $$;
