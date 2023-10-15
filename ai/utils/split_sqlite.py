import argparse
import sqlite3
import os
from pathlib import Path


def get_unique_session_ids(cursor):
	cursor.execute('SELECT DISTINCT session_id FROM maptodon_raw')
	return [item[0] for item in cursor.fetchall()]


def create_and_populate_new_db(old_cursor, session_id, new_db_path):
	new_db_connection = sqlite3.connect(new_db_path)
	new_cursor = new_db_connection.cursor()

	new_cursor.execute('''
	CREATE TABLE IF NOT EXISTS maptodon_raw (
		uuid TEXT UNIQUE,
		session_id TEXT NOT NULL,
		lat FLOAT NOT NULL,
		long FLOAT NOT NULL,
		orientation_x FLOAT NOT NULL,
		orientation_y FLOAT NOT NULL,
		orientation_z FLOAT NOT NULL,
		ts TIMESTAMP NOT NULL,
		image_blob BLOB NOT NULL
	)
	''')

	query = 'SELECT * FROM maptodon_raw WHERE session_id = ?'
	old_cursor.execute(query, (session_id,))

	rows = old_cursor.fetchall()
	new_cursor.executemany('''
	INSERT INTO maptodon_raw (uuid, session_id, lat, long, orientation_x, orientation_y, orientation_z, ts, image_blob)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	''', rows)

	new_db_connection.commit()
	new_db_connection.close()


def split_db_by_session_id(old_db_path, output_dir):
	old_db_connection = sqlite3.connect(old_db_path)
	old_cursor = old_db_connection.cursor()

	os.makedirs(output_dir, exist_ok=True)

	session_ids = get_unique_session_ids(old_cursor)

	for session_id in session_ids:
		new_db_path = os.path.join(output_dir, f'db_session_{session_id}.sqlite')
		create_and_populate_new_db(old_cursor, session_id, new_db_path)
		print(f"Data for session_id {session_id} copied successfully to {new_db_path}")

	old_db_connection.close()


if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--db_file', type=Path, required=True, help="Path to the input SQLite database file")
	parser.add_argument('--output_dir', type=Path, required=True, help="Path to the output directory where split databases will be stored")
	args = parser.parse_args()

	split_db_by_session_id(args.db_file, args.output_dir)
