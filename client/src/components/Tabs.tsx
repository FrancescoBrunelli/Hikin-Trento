import { useState, useEffect } from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    storageKey?: string;        // key to remember active tab in localStorage
    className?: string;         // custom CSS class for styling
}

function Tabs({ tabs, storageKey, className = '' }: TabsProps) {
    const [activeTab, setActiveTab] = useState<string>(() => {
        // if storageKey provided, try to restore last active tab
        if (storageKey) {
            return localStorage.getItem(storageKey) || tabs[0]?.id;
        }
        return tabs[0]?.id;
    });

    // save active tab to localStorage when it changes
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, activeTab);
        }
    }, [activeTab, storageKey]);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    return (
        <div className={`tabs-container ${className}`}>
            {/* TAB HEADERS */}
            <div className="tabs-header">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tabs-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        {tab.icon && <span className="tabs-icon">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="tabs-content">
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
}

export default Tabs;