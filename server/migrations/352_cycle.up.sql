CREATE TABLE cycle (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    team_id UUID NOT NULL,
    number INT NOT NULL CHECK (number > 0),
    name TEXT NOT NULL DEFAULT '' CHECK (char_length(name) <= 100),
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'previous')),
    auto_archive_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT cycle_date_order CHECK (end_date > start_date)
);
