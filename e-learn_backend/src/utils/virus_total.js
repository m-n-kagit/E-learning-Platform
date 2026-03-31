import totalVirus from 'totalvirus-api';
import FormData  from 'form-data';
import axios  from "axios"

const API_KEY = process.env.VIRUS_TOTAL_API_KEY;


async function uploadFile(filePath) {
    try {
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
    }
}


async function getReport(analysisId) {
    try {
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
    }
}

async function virus_check(analysisId){
    const report  = await getReport(analysisId);
    const stats = report.data.data.attributes.stats;
    const maliciousCount = stats.malicious;
    const supiciousCount = stats.suspicious;
    const harmlessCount = stats.harmless;
    if(maliciousCount > 0 || supiciousCount > 0 || harmlessCount ===0){//definatly not clean
        return false; // File is potentially harmful
    }
    return true; // File is clean
}


export default { uploadFile , virus_check}


 




