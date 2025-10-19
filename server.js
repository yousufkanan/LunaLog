const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors());
app.use(express.json());
app.use(logger);

const flaskUrl = 'http://127.0.0.1:5100'

function logger(req,res,next) {
    console.log(req.originalUrl);
    next();
}

function calculateWeightedScore(questionValues, weights) {
    let sum = 0;
    const sumOfWeights = 25;
    for(let i = 0; i < questionValues.length; i++) {
        let value = questionValues[i];
        let weight = weights[i];

        if(i === 2){
            value = 11 - value;
        }

        sum += value * weight;
    }

    return sum / sumOfWeights;
}

async function sendDataToFlask(data) {
    try{
        const response = await fetch(flaskUrl + '/journal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if(!response.ok) {
            throw new Error(`${response.status}`);
        }

        const result = await response.json();
        console.log("Success: ", result);
    } catch (err) {
        console.error("Error in sendDataToFlask", err);
        throw err;
    }
}

async function getDataFromFlask() {
    try {
        const response = await fetch(flaskUrl + '/journal/all');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error("Failed to fetch journal entries from Flask:", error);
        return [];
    }
}

async function triggerReccomendations() {
    try{
        const response = await fetch(flaskUrl + '/recommend', {
            method: 'POST'
        });

        if(!response.ok) {
            throw new Error(`${response.status}`)
        }

        const result = (await response.json());
        console.log(result.message);

    } catch (err) {
        console.error(err)
    }
}

app.post('/submit', async (req,res) => {
    const weights = [4,1,4,4,2,2,2,1,1,4];
    try
    { 
        console.log(req.body)
        const questionValues = req.body.questionValues;
        const entry_date = Date.now();
        const moodScore = calculateWeightedScore(questionValues, weights);

        const questionDict = {}
        for(let i = 0;i < questionValues.length;i++){
            let key = `q${i + 1}`;
            questionDict[key] = questionValues[i];
        }

        const moodEvaluation = {
            entry_date,
            moodScore,
            questionDict
        };

        console.log(moodEvaluation)

        console.log("running")
        await sendDataToFlask(moodEvaluation);
        await triggerReccomendations();
        
        console.log("MoodEvalObject: ", moodEvaluation);
        res.status(200).json({message: "submitted successfully"});
    }
    catch(error){
        res.status(500).json({message: "Server error"});
    }
});

app.get('/journalEntries', async (req,res) => {
    try {
        const entries = await getDataFromFlask();
        if (entries === null) {
            // This happens if the fetch failed inside getDataFromFlask
            return res.status(500).json({ message: "Failed to retrieve journal entries from the data service." });
        }
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(8000, '0.0.0.0', () => {
    console.log('Server listening on port 8000')
});