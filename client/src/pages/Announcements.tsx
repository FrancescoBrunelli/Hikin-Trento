import {useEffect, useState} from 'react';
import "../styles/Announcements.css"

type Announcement = {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
};

function AnnouncementsPanel() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/managedStructure/announcements", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
        };
        fetchAnnouncements();
    }, []);

    const handleAddAnnouncement = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/managedStructure/announcements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create announcement");
            }
            // Add new announcement to the list
            setAnnouncements(prev => [data.announcement, ...prev]);
            // Clear input fields
            setTitle("");
            setDescription("");
            // Close form
            setShowAdvanced(false);
        } catch (error) {
            console.error("Error creating announcement:", error);
        }
    };

    const handleStartEdit = (announcement: Announcement) => {
        setShowAdvanced(false);
        setEditingId(announcement._id);
        setTitle(announcement.title);
        setDescription(announcement.description);
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            const url = editingId ? `/api/managedStructure/announcements/${editingId}` : "/api/managedStructure/announcements";
            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title, description })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to save announcement");

            if (editingId) {
                setAnnouncements(prev => prev.map(a => a._id === editingId ? data.announcement : a));
            } else {
                setAnnouncements(prev => [data.announcement, ...prev]);
            }

            // Reset
            setTitle(""); setDescription("");
            setEditingId(null);
            setShowAdvanced(false);
        } catch (error) {
            console.error("Error saving announcement:", error);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/managedStructure/announcements/${id}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`}
            });
            if (!response.ok) throw new Error("Failed to delete announcement");
            setAnnouncements(prev => prev.filter(a => a._id !== id));
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

    return (
        <div className="announcements-panel">
            <button onClick={() => {
                if (showAdvanced) { setTitle(""); setDescription(""); }
                setShowAdvanced(!showAdvanced);
            }} className="add-announcement-btn">
                {showAdvanced ? '▲ Hide' : '+ Add New Announcement'}
            </button>
            {showAdvanced && (
                <>
                    <div className="announcement-form">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Description of the announcement..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button onClick={handleAddAnnouncement} className="add-announcement-btn">Confirm</button>
                </>
            )}

            {announcements.length === 0 ? (
                <p className="announcements-empty">No announcements yet. Add your first one!</p>
            ) : (
                <div className="announcement-list">
                    {announcements.map(announcement => (
                        <div key={announcement._id} className="announcement-card">
                            {editingId === announcement._id ? (
                                <div className="announcement-form">
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                                    <div className="announcement-card-actions">
                                        <button className="announcement-action-btn edit" onClick={handleSubmit}>Save Changes</button>
                                        <button className="announcement-action-btn delete" onClick={() => setEditingId(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="announcement-card-title">{announcement.title}</h3>
                                    <p className="announcement-card-description">{announcement.description}</p>
                                    <p className="announcement-card-date">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="announcement-card-actions">
                                        <button className="announcement-action-btn edit" onClick={() => handleStartEdit(announcement)}>Edit</button>
                                        <button className="announcement-action-btn delete" onClick={() => handleDeleteAnnouncement(announcement._id)}>Delete</button>
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

export default AnnouncementsPanel;
