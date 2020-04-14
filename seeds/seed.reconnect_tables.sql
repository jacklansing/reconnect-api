BEGIN;

TRUNCATE reconnect_users, reconnect_posts, reconnect_messages, reconnect_messages_threads RESTART IDENTITY CASCADE;

INSERT INTO reconnect_users (user_name, password, display_name, user_type)
VALUES
('picard', 'ncc1701', 'Jean-Luc', 'Donor'),
('klingonw', 'password', 'Worf', 'Seeking'),
('troi123', 'farpoint87', 'Deanna', 'Seeking');

INSERT INTO reconnect_posts (title, description, device, condition, location, user_id)
VALUES
('Old iPhone 6', 'Well taken care of, in quite good condition.', 'iPhone', 'good', 'Albany, NY', 1),
('Pixel 2 - Good Shape!', 'The pixel 2 is still a great phone to get connected with. I took very good care of mine.', 'Android', 'very good', 'Albany, NY', 2),
('Thinkpad', 'Used to use this as a work computer before upgrading. Slightly beat up but still holds a charge!', 'Windows', 'okay', 'Schenectady, NY', 3);

INSERT INTO reconnect_messages_threads (author_id, recipient_id)
VALUES
(1, 2),
(3, 2);

INSERT INTO reconnect_messages (content, thread_id, author_id)
VALUES
('Hey there im interested in your old smartphone. It belongs in a museum!', 1, 1),
('Hey would you be able to meet me on Mars?', 2, 3);


COMMIT;