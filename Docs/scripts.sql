CREATE USER eventsync_user WITH PASSWORD 'Eventsync2024!';

CREATE DATABASE eventsync OWNER eventsync_user;

\c eventsync

GRANT ALL ON SCHEMA public TO eventsync_user;
GRANT ALL PRIVILEGES ON DATABASE eventsync TO eventsync_user;
GRANT CREATE ON SCHEMA public TO eventsync_user;

ALTER SCHEMA public OWNER TO eventsync_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO eventsync_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO eventsync_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO eventsync_user;