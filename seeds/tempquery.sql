SELECT DISTINCT ON (m.thread_id) 
m.thread_id, m.content, m.author_id, m.date_created
FROM reconnect_messages m INNER JOIN reconnect_messages_threads t  
ON m.thread_id = t.id ORDER BY m.thread_id, m.date_created DESC

SELECT DISTINCT ON (m.thread_id) 
m.thread_id, m.content, m.author_id, m.date_created
FROM reconnect_messages m INNER JOIN reconnect_messages_threads t  
ON m.thread_id = t.id WHERE t.recipient_id = 4 OR t.author_id = 4 ORDER BY m.thread_id, m.date_created DESC