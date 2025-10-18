"""
Get the results from the api and ingewst them in the journals database.

"""
from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

@app.route('/journal', methods=['POST'])
def add_entry():
    data = request.json
    conn = sqlite3.connect('journal_app.db')
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO JournalEntries 
        (entry_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, moodScore, response)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['entry_date'], data['q1'], data['q2'], data['q3'], data['q4'],
        data['q5'], data['q6'], data['q7'], data['q8'], data['q9'], data['q10'],
        data['moodScore'],
        data['response']
    ))
    conn.commit()
    entry_id = cur.lastrowid
    conn.close()
    return jsonify({"success": True, "entry_id": entry_id})



@app.route('/analyze', methods=['POST'])
def analyze_entry():
    data = request.json
    # Example fake AI analysis
    response = f"Your average mood score is {sum([data[f'q{i}'] for i in range(1,11)]) / 10:.2f}."
    return jsonify({"ai_response": response})

@app.route('/recommend', methods=['POST'])
def recommend_entry():
    data = request.json
    # Example fake AI recommendation
    recommendation = "Based on your entries, consider practicing mindfulness and regular exercise."
    return jsonify({"ai_recommendation": recommendation})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5100)
