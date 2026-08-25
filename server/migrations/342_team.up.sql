CREATE TABLE team (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    key TEXT NOT NULL CHECK (key ~ '^[A-Z0-9]{1,10}$'),
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
    icon TEXT,
    color TEXT CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'),
    issue_counter INT NOT NULL DEFAULT 0,
    cycles_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    cycle_duration_weeks INT NOT NULL DEFAULT 2 CHECK (cycle_duration_weeks BETWEEN 1 AND 8),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
