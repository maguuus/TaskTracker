INSERT INTO "Users" ("Id", "Email", "PasswordHash", "Name") VALUES
    ('00000000-0000-0000-0000-000000000001', 'ci-seed@test.com', '$2a$11$8bbwww1EJfRSrgC1I188Hu7.CrpOqr30WeAqoAUTaN99ZiFoFzxj2', 'CI Seed User');

INSERT INTO "Projects" ("Id", "Name", "OwnerId", "CreatedAt") VALUES
    ('00000000-0000-0000-0000-000000000010', 'CI Test Project', '00000000-0000-0000-0000-000000000001', NOW());

INSERT INTO "Columns" ("Id", "Title", "OrderIndex", "ProjectId") VALUES
    ('00000000-0000-0000-0000-000000000020', 'To Do', 0, '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000021', 'In Progress', 1, '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000022', 'Done', 2, '00000000-0000-0000-0000-000000000010');

INSERT INTO "TaskItems" ("Id", "Title", "Description", "Priority", "Urgency", "OrderIndex", "ColumnId", "CreatedAt", "UpdatedAt") VALUES
    ('00000000-0000-0000-0000-000000000030', 'CI Test Task', 'Seed task for integration tests', 'Medium', 'Normal', 0, '00000000-0000-0000-0000-000000000020', NOW(), NOW());
