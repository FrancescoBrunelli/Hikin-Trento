import {useEffect, useState} from "react";
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
    const [editingId, setEditingId] = useState<string | null>(null);
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

    const handleStartEdit = (event: Event) => {
        setShowAdvanced(false);
        setEditingId(event._id);
        setTitle(event.title);
        setDescription(event.description);
        setStartDate(event.start_date.split('T')[0]); // convert ISO to date input format
        setEndDate(event.end_date.split('T')[0]);
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            const url = editingId
                ? `/api/managedStructure/events/${editingId}`
                : "/api/managedStructure/events";
            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, start_date, end_date })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to save event");

            if (editingId) {
                setEvents(prev => prev.map(e => e._id === editingId ? data.event : e));
            } else {
                setEvents(prev => [data.event, ...prev]);
            }

            // Reset
            setTitle(""); setDescription(""); setStartDate(""); setEndDate("");
            setEditingId(null);
            setShowAdvanced(false);
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/managedStructure/events/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete event");
            setEvents(prev => prev.filter(e => e._id !== id));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    return (
            <div className="events-panel">
                <button onClick={() => {
                    if (showAdvanced) { setTitle(""); setDescription(""); setStartDate(""); setEndDate(""); }
                    setShowAdvanced(!showAdvanced);
                }} className="add-event-btn">
                    {showAdvanced ? '▲ Hide' : '+ Add New Event'}
                </button>
                {showAdvanced && (
                    <>
                        <div className="event-form">
                            <input
                                type="text"
                                placeholder="Event Name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Description of the event..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="event-form-row">
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
                            </div>
                        </div>
                        <button onClick={handleAddEvent} className="add-event-btn">Confirm</button>
                    </>
                )}

                {events.length === 0 ? (
                    <p className="events-empty">No events yet. Add your first one!</p>
                ) : (
                    <div className="event-list">
                        {events.map(event => (
                            <div key={event._id} className="event-card">
                                {editingId === event._id ? (
                                    <div className="event-form">
                                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                                        <div className="event-form-row">
                                            <input type="date" value={start_date} onChange={(e) => setStartDate(e.target.value)} />
                                            <input type="date" value={end_date} onChange={(e) => setEndDate(e.target.value)} />
                                        </div>
                                        <div className="event-card-actions">
                                            <button className="event-action-btn edit" onClick={handleSubmit}>Save Changes</button>
                                            <button className="event-action-btn delete" onClick={() => setEditingId(null)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="event-card-title">{event.title}</h3>
                                        <p className="event-card-description">{event.description}</p>
                                        <p className="event-card-dates">
                                            {new Date(event.start_date).toLocaleDateString()} → {new Date(event.end_date).toLocaleDateString()}
                                        </p>
                                        <div className="event-card-actions">
                                            <button className="event-action-btn edit" onClick={() => handleStartEdit(event)}>Edit</button>
                                            <button className="event-action-btn delete" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>

    )
}

export default EventsPanel;
