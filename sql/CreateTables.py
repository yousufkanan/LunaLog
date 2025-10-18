"""
This script contains SQL statements to create the necessary tables for the application.

Tables Created:
1. JournalEntries: Stores journal entries with fields for entry ID, date, q1, q2, q3, and q4...q10 , response int
2. AI Responses: Stores AI-generated responses with fields for response ID, entry ID (foreign key), and response text.
3. Ai Recommendations: Stores AI-generated recommendations with fields for recommendation ID, entry ID (foreign key), and recommendation text.
"""
import sqlite3

def _create_table(conn):
    try: 
        with conn:
            conn.execute("""
                         CREATE TABLE IF NOT EXISTS JournalEntries (
                    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_date TEXT NOT NULL,
                    q1 INT,
                    q2 INT,
                    q3 INT,
                    q4 INT,
                    q5 INT,
                    q6 INT,
                    q7 INT,
                    q8  INT,
                    q9 INT,
                    q10 INT,
                    moodScore INT,
                    response TEXT
                );
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS AIResponses (
                    response_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_id INTEGER NOT NULL,
                    response_text TEXT NOT NULL,
                    FOREIGN KEY (entry_id) REFERENCES JournalEntries(entry_id)
                );
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS AIRecommendations (
                    recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_id INTEGER NOT NULL,
                    recommendation_text TEXT NOT NULL,
                    FOREIGN KEY (entry_id) REFERENCES JournalEntries(entry_id)
                );
            """)
    except sqlite3.Error as e:
        print(f"An error occurred while creating tables: {e}")

if __name__ == "__main__":
    # Connect to the SQLite database (or create it if it doesn't exist)
    connection = sqlite3.connect('journal_app.db')
    _create_table(connection)
    connection.close()