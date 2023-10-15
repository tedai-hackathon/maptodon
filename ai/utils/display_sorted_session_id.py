import argparse
import sqlite3
from pathlib import Path


def get_ordered_session_ids(cursor):
	cursor.execute('''
	SELECT DISTINCT session_id 
	FROM maptodon_raw 
	GROUP BY session_id 
	ORDER BY MIN(ts)
	''')
	return [item[0] for item in cursor.fetchall()]


def print_session_ids(session_ids):
	print("Session IDs ordered by timestamp:")
	for sid in session_ids:
		print(sid)


def delete_duplicate_sessions_except_first(cursor, session_ids):
	for sid in session_ids:
		cursor.execute('''
		DELETE FROM maptodon_raw 
		WHERE session_id = ? 
		AND ts NOT IN (
			SELECT MIN(ts) 
			FROM maptodon_raw 
			WHERE session_id = ?
		)
		''', (sid, sid))


def manage_db(db_file):
	# Connect to the SQLite database
	connection = sqlite3.connect(db_file)
	cursor = connection.cursor()

	# Get and print ordered session IDs
	session_ids = get_ordered_session_ids(cursor)
	print_session_ids(session_ids)

	# Delete all rows with the same session_id except the first one based on timestamp
	delete_duplicate_sessions_except_first(cursor, session_ids)

	# Commit the changes and close the connection
	connection.commit()
	connection.close()


if __name__ == '__main__':
	parser = argparse.ArgumentParser(description="A tool for managing SQLite database based on session IDs and timestamps.")
	parser.add_argument('--db_file', type=Path, required=True, help="Path to the SQLite database file.")
	args = parser.parse_args()

	manage_db(args.db_file)
