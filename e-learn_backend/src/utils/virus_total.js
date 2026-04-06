import fs from "fs";
import FormData  from 'form-data';
import axios  from "axios"

const API_KEY = process.env.VIRUS_TOTAL_API_KEY?.trim();
const POLL_INTERVAL_MS = 3000; // 3sec between each poll
const MAX_POLL_ATTEMPTS = 10;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureApiKey() {
    if (!API_KEY) {
        const error = new Error("VirusTotal API key is missing.");
        error.code = "VT_API_KEY_MISSING";
        throw error;
    }
}

async function uploadFile(filePath) {
    try {
        ensureApiKey();
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));

        const response = await axios.post(
            "https://www.virustotal.com/api/v3/files",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "x-apikey": API_KEY
                }
            }
        );

        console.log("Upload Success:");
        console.log(response.data);

        return response.data.data.id; // analysis ID

    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        throw error;
    }
}


async function getReport(analysisId) {
    try {
        ensureApiKey();
        const response = await axios.get(
            `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
            {
                headers: {
                    "x-apikey": API_KEY
                }
            }
        );

        console.log("Scan Report:");
        console.log(response.data);
        return response.data.data; // Return the report data

    } catch (error) {
        console.error("Error fetching report:", error.response?.data || error.message);
        throw error;
    }
}

async function virus_check(analysisId){
    if (!analysisId) {
        const error = new Error("Analysis ID is required to check VirusTotal report.");
        error.code = "VT_ANALYSIS_ID_MISSING";
        throw error;
    }

    let lastStatus = "unknown";

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        const report = await getReport(analysisId);
        const status = report.attributes?.status;
        lastStatus = status ?? "unknown";
        const stats = report.attributes?.stats ?? {};
        const maliciousCount = stats.malicious ?? 0;
        const suspiciousCount = stats.suspicious ?? 0;

        if (maliciousCount > 0 || suspiciousCount > 0) {
            console.log("Scan completed. Stats:", stats);
            return false;
        }

        if (attempt < MAX_POLL_ATTEMPTS - 1) {
            await delay(POLL_INTERVAL_MS);
        }
    } 
    console.log(`Scan completed after ${MAX_POLL_ATTEMPTS} checks. Last status: ${lastStatus}`);
    return true;
}


export default { uploadFile , virus_check}


 


