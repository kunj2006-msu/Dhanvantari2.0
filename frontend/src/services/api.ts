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

export const sendMentalHealthMessage = async (history: { role: string, text: string }[], language: string) => {
    try {
        const token = localStorage.getItem('dhanvantari_token');
        const response = await axios.post(`${API_BASE_URL}/mental-health/chat`, {
            history: history,
            language: language
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error sending mental health message:", error);
        throw new Error("Failed to communicate with support service.");
    }
};

export const saveMoodSession = async (initialMood: string, finalMood: string) => {
    const token = localStorage.getItem('dhanvantari_token');
    await axios.post(`${API_BASE_URL}/mental-health/mood`, { initialMood, finalMood }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};
// (Keep your fetchMoodHistory function exactly as it is!)
export const fetchMoodHistory = async () => {
    const token = localStorage.getItem('dhanvantari_token');
    const response = await axios.get(`${API_BASE_URL}/mental-health/mood`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data; // Returns array: [{ recordedDate: "2026-05-31", finalMood: "Good" }, ...]
};

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    state: string;
    city: string;
    experience: string;
    clinicAddress: string;
    latitude?: number;
    longitude?: number;
    firstAvailableDate?: string;
}

export const fetchDoctors = async (state?: string, city?: string, specialization?: string): Promise<Doctor[]> => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token) return [];

    try {
        const params = new URLSearchParams();
        if (state) params.append('state', state);
        if (city) params.append('city', city);
        if (specialization) params.append('specialization', specialization);

        const response = await axios.get(`http://localhost:8080/api/patient/doctors?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
};

export interface AppointmentPayload {
    doctorId: string;
    scheduledDate: string; // YYYY-MM-DD
    scheduledTime: string; // hh:mm AM/PM
    symptomsNotes: string;
}

export const bookAppointment = async (payload: AppointmentPayload): Promise<{ message: string }> => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error("You are not authenticated. Please log in again.");
    }

    try {
        const response = await axios.post('http://localhost:8080/api/patient/appointments/book', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error booking appointment:", error);
        throw new Error("Failed to book appointment.");
    }
};

export interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    date: string; // DD/MM/YYYY
    time: string; // hh:mm a
    status: string;
    clinicAddress: string;
    latitude: number;
    longitude: number;
    doctorNotes: string | null;
    symptomsNotes: string;
}

export const fetchAppointments = async (): Promise<Appointment[]> => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token || token === 'null' || token === 'undefined') {
        return [];
    }

    try {
        const response = await axios.get('http://localhost:8080/api/patient/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
};

export interface DoctorAppointment {
    id: string;
    patientId: string;
    patientName: string;
    date: string;
    time: string;
    reason: string;
    age: number;
    gender: string;
    bloodGroup: string;
    pastHistory: string;
    heightCm?: number;
    weightKg?: number;
    doctorNotes: string | null;
    status: string;
}

export interface TriageMessage {
    role: string;
    content: string;
}

export interface PatientTriageSession {
    sessionId: number;
    title: string;
    languageCode: string;
    createdAt: string;
    messages: TriageMessage[];
}

export const fetchDoctorAppointments = async (): Promise<DoctorAppointment[]> => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token || token === 'null' || token === 'undefined') {
        return [];
    }

    try {
        const response = await axios.get('http://localhost:8080/api/doctor/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        throw error;
    }
};

export const updateAppointmentNotes = async (appointmentId: string, doctorNotes: string): Promise<any> => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error("User not authenticated.");
    }

    try {
        const response = await axios.put(`http://localhost:8080/api/doctor/appointments/${appointmentId}/notes`, {
            doctorNotes
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating appointment notes:", error);
        throw error;
    }
};

export const fetchPatientTriageHistory = async (patientId: string): Promise<PatientTriageSession[]> => {
    const token = localStorage.getItem('dhanvantari_token');
    if (!token || token === 'null' || token === 'undefined') {
        return [];
    }

    try {
        const response = await axios.get(`http://localhost:8080/api/doctor/patients/${patientId}/triage-history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching patient triage history:", error);
        throw error;
    }
};

export interface LocationState {
    id: number;
    name: string;
}

export interface LocationCity {
    id: number;
    name: string;
}

export const fetchStates = async (): Promise<LocationState[]> => {
    try {
        const response = await axios.get('http://localhost:8080/api/locations/states');
        return response.data;
    } catch (error) {
        console.error("Error fetching states:", error);
        return [];
    }
};

export const fetchCitiesByState = async (stateId: number): Promise<LocationCity[]> => {
    try {
        const response = await axios.get(`http://localhost:8080/api/locations/states/${stateId}/cities`);
        return response.data;
    } catch (error) {
        console.error("Error fetching cities by state:", error);
        return [];
    }
};