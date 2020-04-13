BEGIN;

TRUNCATE reconnect_users RESTART IDENTITY CASCADE;

INSERT INTO reconnect_users (user_name, password, display_name)
VALUES
('picard', 'ncc1701', 'Jean-Luc'),
('klingonw', 'password', 'Worf'),
('troi123', 'farpoint87', 'Deanna');

COMMIT;