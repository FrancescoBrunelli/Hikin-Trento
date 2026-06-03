import Layout from "../components/Layout.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/Events.css";

type Event = {
    _id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
};

function EventsPanel() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem("token");

            const response = await fetch("/api/managedStructure/events", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            setEvents(Array.isArray(data.events) ? data.events : []);
        };

        fetchEvents();
    }, []);

    const handleAddEvent = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("TOKEN:", token);
            const response = await fetch("/api/managedStructure/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    start_date,
                    end_date
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create event");
            }
            // Add new event to the list
            setEvents(prev => [data.event, ...prev]);
            // Clear input fields
            setTitle("");
            setDescription("");
            setStartDate("");
            setEndDate("");
            // Close form
            setShowAdvanced(false);
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    return (
            <div className="events-panel">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="add-event-btn">{showAdvanced ? '▲ Hide' : '+ Add New Event'}</button>
                {showAdvanced && (
                    <>
                        <input
                            type="text"
                            placeholder="Event Name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="text"
                            placeholder="Description of the event..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="date"
                            value={start_date}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            value={end_date}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <button onClick={handleAddEvent} className="add-event-btn">Confirm</button>
                    </>
                )}
                <div className="event-list">
                    {events.map(event => (
                        <div key={event._id} className="event-card">
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <p>
                                {new Date(event.start_date).toLocaleDateString()}
                                {" - "}
                                {new Date(event.end_date).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

    )
}

export default EventsPanel;
