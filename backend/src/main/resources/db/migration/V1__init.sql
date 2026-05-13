-- ============================================================
-- V1 — initial schema for tech-consulting-tool
-- ============================================================

CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    full_name    VARCHAR(255) NOT NULL,
    role         VARCHAR(32)  NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);

CREATE TABLE clients (
    id            BIGSERIAL PRIMARY KEY,
    company_name  VARCHAR(255) NOT NULL,
    contact_name  VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(64),
    notes         TEXT,
    owner_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_owner ON clients(owner_id);
CREATE INDEX idx_clients_company ON clients(company_name);

CREATE TABLE projects (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    client_id     BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    consultant_id BIGINT REFERENCES users(id)   ON DELETE SET NULL,
    start_date    TIMESTAMP,
    end_date      TIMESTAMP,
    budget_cents  BIGINT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_client     ON projects(client_id);
CREATE INDEX idx_projects_consultant ON projects(consultant_id);
CREATE INDEX idx_projects_status     ON projects(status);

CREATE TABLE tasks (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(32) NOT NULL DEFAULT 'TODO',
    assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    due_date    TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_project  ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status   ON tasks(status);

CREATE TABLE time_entries (
    id           BIGSERIAL PRIMARY KEY,
    project_id   BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id      BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    minutes      INT    NOT NULL CHECK (minutes > 0),
    work_date    DATE   NOT NULL,
    description  TEXT,
    billable     BOOLEAN NOT NULL DEFAULT TRUE,
    rate_cents   INT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_user    ON time_entries(user_id);
CREATE INDEX idx_time_entries_date    ON time_entries(work_date);
