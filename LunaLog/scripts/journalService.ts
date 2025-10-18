const API_BASE_URL = "http://10.77.160.152:8000"; // Replace with your actual API URL

// Submit journal entry
export async function submitJournalEntry(
  questionValues: number[]
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionValues }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Submission successful:", result);
    return true;
  } catch (error) {
    console.error("Error submitting journal entry:", error);
    return false;
  }
}

export async function getJournalEntries(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/journalEntries`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
}
