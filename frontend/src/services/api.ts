import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/patient/chat'; 

// UPDATED: Now accepts sessionId
export const sendTriageMessage = async (message: string, language: string, sessionId: number | null = null) => {
    try {
        const token = localStorage.getItem('dhanvantari_token');
        if (!token || token === 'null' || token === 'undefined') {
            throw new Error("You are not authenticated. Please log in again.");
        }
        
        const response = await axios.post(`${API_BASE_URL}/triage`, {
            message: message,
            language: language,
            sessionId: sessionId // Send the ID to Java!
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Java now returns { response: "...", sessionId: 123 }
        return response.data; 
    } catch (error) {
        console.error("Error sending triage message:", error);
        throw new Error("Failed to communicate with the triage service.");
    }
};

export const fetchChatHistory = async () => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token) return [];
    
    try {
        const response = await axios.get(`${API_BASE_URL}/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // 🕵️ DETECTIVE LOG: Print the exact data from Java to the browser console
        console.log("DATA FROM JAVA BACKEND:", response.data); 
        return response.data;
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

// Delete a specific chat session
export const deleteChatSession = async (sessionId: number) => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token) return false;
    
    try {
        await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error("Error deleting session:", error);
        return false;
    }
};

// Fetch messages for a specific session
export const fetchSessionMessages = async (sessionId: number) => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token) return [];
    
    try {
        const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};