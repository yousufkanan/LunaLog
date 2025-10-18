import sqlite3
import os
import re
from typing import Dict, List
from flask import Flask, request, jsonify 
from google import genai
from dotenv import load_dotenv

# --- GLOBAL SETUP ---

# 1. Load the .env file to get GEMINI_API_KEY
load_dotenv() 

client = None
RECOMMENDATION_MODEL = 'gemini-2.5-flash'
DB_FILE = 'journal_app.db' # Define the database file name globally

try:
    # 2. Initialize GenAI Client
    if os.getenv("GEMINI_API_KEY"):
        client = genai.Client() 
    else:
        print("Error: GEMINI_API_KEY not found in environment or .env file.")
        
except Exception as e:
    print(f"Error initializing GenAI client: {e}")
    client = None

app = Flask(__name__)

# --- DATABASE SCHEMA AND INITIALIZATION (from createTables.py) ---

def _create_table(conn):
    """
    Creates the necessary tables with the correct schema, including all 
    insight and recommendation columns for structured storage.
    """
    try: 
        with conn:
            # 1. JournalEntries Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS JournalEntries (
                    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_date TEXT NOT NULL,
                    q1 INT, q2 INT, q3 INT, q4 INT, q5 INT, 
                    q6 INT, q7 INT, q8 INT, q9 INT, q10 INT,
                    moodScore INT,
                    response TEXT
                );
            """)

            # 2. AIResponses Table (Contains structured AI output)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS AIResponses (
                    response_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_id INTEGER NOT NULL,
                    
                    insight_1 TEXT,
                    insight_2 TEXT,
                    insight_3 TEXT,
                    
                    recommendation_1 TEXT,
                    recommendation_2 TEXT,
                    recommendation_3 TEXT,
                    
                    full_response_text TEXT, 
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    FOREIGN KEY (entry_id) REFERENCES JournalEntries(entry_id)
                        ON DELETE CASCADE ON UPDATE CASCADE
                );
            """)
            print("Database tables created (or verified) successfully.")
    except sqlite3.Error as e:
        print(f"An error occurred while creating tables: {e}")

def init_db():
    """Initializes the database connection and tables."""
    connection = sqlite3.connect(DB_FILE)
    _create_table(connection)
    connection.close()

# --- UTILITY FUNCTIONS (from Ingests.py) ---

def _get_recent_entries(conn) -> List[tuple]:
    """Fetches the last 10 journal entries including their IDs."""
    cur = conn.cursor()
    cur.execute("""
        SELECT entry_id, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, response 
        FROM JournalEntries 
        ORDER BY entry_id DESC 
        LIMIT 10
    """)
    return cur.fetchall()

def parse_gemini_response(response_data: Dict) -> Dict[str, List[str]]:
    """
    Parse a Gemini-style AI response into structured insights and recommendations.
    
    UPDATED: Regex now allows for any leading whitespace before the bullet point, 
    making it resilient to formatting inconsistencies like leading tabs or spaces 
    the model might add.
    """
    entry_id = response_data.get("entry_id")
    text = response_data.get("recommendation", "")
    
    # NEW Pattern: \s* (zero or more spaces) at the start of the line, then the bullet, 
    # followed by whitespace, then capture the text.
    bullet_pattern = re.compile(r"^\s*[*\-•]\s+(.*)", re.MULTILINE)
    
    # Find all bulleted items in the entire response text
    all_bullets = bullet_pattern.findall(text)
    
    # Clean up whitespace and filter empty results
    all_bullets = [b.strip() for b in all_bullets if b.strip()]
    
    # Assuming the first 5 are Insights and the next 3 are Recommendations, 
    # based on the prompt structure.
    
    # Get up to the first 5 for insights
    insights = all_bullets[:5]
    
    # Get the next 3 for recommendations (starting from index 5)
    recommendations = all_bullets[5:8] 
    
    return {
        "entry_id": entry_id,
        "insights": insights,
        "recommendations": recommendations
    }

# --- FLASK ROUTES (from Ingests.py) ---

@app.route('/journal', methods=['POST'])
def add_entry():
    """Adds a new journal entry to the JournalEntries table."""
    data = request.json
    # Validation check
    if not all(k in data for k in ['entry_date', 'response', 'moodScore'] + [f'q{i}' for i in range(1, 11)]):
        return jsonify({"success": False, "error": "Missing data fields for journal entry"}), 400

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            INSERT INTO JournalEntries 
            (entry_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, moodScore, response)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['entry_date'], data['q1'], data['q2'], data['q3'], data['q4'],
            data['q5'], data['q6'], data['q7'], data['q8'], data['q9'], data['q10'],
            data['moodScore'], data['response']
        ))
        conn.commit()
        entry_id = cur.lastrowid
        return jsonify({"success": True, "entry_id": entry_id}), 201
    except sqlite3.Error as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()

@app.route('/recommend', methods=['POST'])
def recommend_entry():
    """
    Get AI recommendations for a journal entry and store them in the database.
    Takes the last 10 entries into account.
    """
    if client is None:
        return jsonify({"success": False, "error": "AI client not initialized"}), 500
    
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        
        # 1. Fetch the last 10 journal entries
        recent_entries_with_ids = _get_recent_entries(conn)
        
        if not recent_entries_with_ids:
            return jsonify({"success": False, "error": "No journal entries found"}), 404
        
        most_recent_entry_id = recent_entries_with_ids[0][0] 
        recent_entries_data = [entry[1:] for entry in recent_entries_with_ids] # data only, no IDs

        # 2. Build prompt
        prompt_intro = (
            "Based on the following journal entries, provide a response with exactly two sections, separated by a main heading. "
            "Section 1: Key Insights (exactly 5 bullet points). "
            "Section 2: Actionable Recommendations (exactly 3 bullet points). "
            "Do not include any other text or headers.\n\n"
        )
        
        entry_prompts = []
        for entry in recent_entries_data:
            # entry[:10] are Q1-Q10, entry[10] is response
            mood_score = sum(entry[:10]) / 10
            q_values = ", ".join([f"Q{i+1}: {entry[i]}" for i in range(10)])
            entry_prompts.append(f"Q/A: ({q_values}), Mood Score: {mood_score:.2f}, Summary: {entry[10]}")
            
        prompt = prompt_intro + "\n".join(entry_prompts)

        # 3. Get AI response
        response = client.models.generate_content(
            model=RECOMMENDATION_MODEL,
            contents=prompt
        )
        ai_response_text = response.text 
        
        # 4. Parse the structured text
        response_data_for_parser = {
            "entry_id": most_recent_entry_id,
            "recommendation": ai_response_text
        }
        parsed_response = parse_gemini_response(response_data_for_parser)
        
        insights = parsed_response["insights"]
        recommendations = parsed_response["recommendations"]
        
        print(f"Parsed AI Response: Insights: {insights}, Recommendations: {recommendations}")
        
        # 5. Prepare and store the structured data
        safe_get = lambda lst, index: lst[index] if len(lst) > index else None
        
        # Ensure we have enough columns for the 8 fields in AIResponses
        insert_values = [
            most_recent_entry_id,
            safe_get(insights, 0), safe_get(insights, 1), safe_get(insights, 2),
            safe_get(recommendations, 0), safe_get(recommendations, 1), safe_get(recommendations, 2),
            ai_response_text # full_response_text (the 8th value)
        ]

        conn.execute("""
            INSERT INTO AIResponses (
                entry_id,
                insight_1, insight_2, insight_3,
                recommendation_1, recommendation_2, recommendation_3,
                full_response_text
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, insert_values)
        
        conn.commit()
            
        return jsonify({
            "success": True,
            "entry_id": most_recent_entry_id,
            "recommendation": ai_response_text 
        }), 201
    
    except sqlite3.Error as e:
        return jsonify({"success": False, "error": str(e)}), 500
    except Exception as e:
        # Catch and print the full error for better debugging
        print(f"Error during AI generation or database operation: {e}")
        return jsonify({"success": False, "error": f"AI generation or database operation failed: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    # Initialize the database on startup (calling the function from createTables.py)
    init_db() 
    # Start the Flask app
    app.run(host='0.0.0.0', port=5100, debug=True)
