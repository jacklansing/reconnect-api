BEGIN;

TRUNCATE reconnect_users, reconnect_posts RESTART IDENTITY CASCADE;

INSERT INTO reconnect_users (user_name, password, display_name, user_type)
VALUES
('picard', 'ncc1701', 'Jean-Luc', 'Donor'),
('klingonw', 'password', 'Worf', 'Seeking'),
('troi123', 'farpoint87', 'Deanna', 'Seeking');



COMMIT;