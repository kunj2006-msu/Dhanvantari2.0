import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/patient/chat'; 

export const sendTriageMessage = async (message: string, language: string) => {
    try {
       // Change this line:
const token = localStorage.getItem('dhanvantari_token');
        
        // ADD THIS CHECK: If there is no token, don't even try to hit the backend!
        if (!token || token === 'null' || token === 'undefined') {
            throw new Error("You are not authenticated. Please log in again.");
        }
        
        const response = await axios.post(`${API_BASE_URL}/triage`, {
            message: message,
            language: language 
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.data.response;
    } catch (error) {
        console.error("Error sending triage message:", error);
        throw new Error("Failed to communicate with the triage service.");
    }
};