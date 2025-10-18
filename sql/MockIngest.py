import sqlite3
import os

DB_FILE = 'journal_app.db'

# --- TEST DATA SETUP ---

# Sample data for testing (Q1-Q10 scores, moodScore, and response)
SAMPLE_ENTRIES = [
    {
        "entry_date": "2024-10-10",
        "q": [5, 4, 5, 5, 4, 5, 4, 5, 5, 4], # High scores
        "moodScore": 4,
        "response": "Had an incredibly productive day at work. Finished the big project ahead of schedule and celebrated with a great dinner with friends. Feeling energized and happy about my progress."
    },
    {
        "entry_date": "2024-10-11",
        "q": [3, 2, 4, 3, 2, 3, 2, 3, 4, 3], # Mixed/lower scores
        "moodScore": 2,
        "response": "The new project deadlines are really stressing me out. Spent 12 hours straight coding and forgot to take a proper break. I feel mentally drained and anxious about the upcoming review."
    },
    {
        "entry_date": "2024-10-12",
        "q": [1, 1, 2, 1, 1, 3, 2, 2, 1, 1], # Very low scores
        "moodScore": 1,
        "response": "Slept badly again, maybe only 4 hours. Couldn't focus on anything today. Skipped the gym and just watched TV. Need to figure out a better sleep schedule and stop drinking coffee late."
    },
    {
        "entry_date": "2024-10-13",
        "q": [4, 5, 3, 4, 5, 4, 5, 4, 3, 5], # High social/activity scores
        "moodScore": 5,
        "response": "Spent the entire afternoon hiking with my family, which was wonderful. Got a lot of exercise and great conversation. My creative scores were lower, but my social battery is fully charged."
    },
    {
        "entry_date": "2024-10-14",
        "q": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], # Neutral scores, last entry (most recent for /recommend)
        "moodScore": 3,
        "response": "Just a standard Monday. Got through my emails, went grocery shopping, and cooked dinner. Nothing exceptional happened, good or bad, but I feel a little isolated after the busy weekend."
    },
]

def seed_database():
    """
    Populates the journal_app.db database with sample entries for testing.
    """
    if not os.path.exists(DB_FILE):
        print(f"Warning: Database file '{DB_FILE}' not found. Please ensure 'app.py' has run at least once to create the tables.")
        return

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    inserted_count = 0
    
    try:
        print(f"Seeding database '{DB_FILE}' with {len(SAMPLE_ENTRIES)} entries...")
        
        for entry in SAMPLE_ENTRIES:
            cur.execute("""
                INSERT INTO JournalEntries 
                (entry_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, moodScore, response)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry['entry_date'], 
                entry['q'][0], entry['q'][1], entry['q'][2], entry['q'][3], entry['q'][4], 
                entry['q'][5], entry['q'][6], entry['q'][7], entry['q'][8], entry['q'][9], 
                entry['moodScore'], entry['response']
            ))
            inserted_count += 1
        
        conn.commit()
        print(f"Successfully inserted {inserted_count} sample entries.")
        
    except sqlite3.Error as e:
        print(f"Database error during seeding: {str(e)}")
    finally:
        conn.close()

if __name__ == '__main__':
    seed_database()
