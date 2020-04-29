BEGIN;

DROP TYPE IF EXISTS device_location;

CREATE TYPE device_location AS ENUM (
    'Albany, NY',
    'Schenectady, NY'
);

ALTER TABLE reconnect_posts
ADD location device_location NOT NULL;

COMMIT;