CREATE TYPE user_category AS ENUM (
    'Donor',
    'Seeking'
);

ALTER TABLE reconnect_users ADD COLUMN user_type user_category NOT NULL;