INSERT INTO events (title, description, start_date, end_date, location, created_at, updated_at)
VALUES ('Tech Event', 'demo', NOW(), NOW() + INTERVAL '1 day', 'Tana', NOW(), NOW());


INSERT INTO rooms (name, capacity)
VALUES ('Main Room', 100);



INSERT INTO sessions (title, description, start_time, end_time, event_id, room_id)
VALUES (
  'Live Session',
  'test',
  NOW() - INTERVAL '1 hour',
  NOW() + INTERVAL '1 hour',
  1,
  1
);



INSERT INTO questions (content, session_id, author_name, upvotes, created_at)
VALUES (
  'What is EventSync?',
  1,
  'John',
  5,
  NOW()
);


INSERT INTO speakers (name)
VALUES ('John Doe');

INSERT INTO session_speakers (session_id, speaker_id)
VALUES (1, 1);