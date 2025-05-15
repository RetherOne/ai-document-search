import React, { useState, useEffect } from "react";
import './ResultsStyle.css';
import { useLocation } from 'react-router-dom';
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import TagSelected from "../../components/Tags/TagSelected.jsx";
import TagCheckBox from "../../components/Tags/TagCheckBox.jsx";
import Document from "../../components/Document/Document.jsx";

const Results = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');

    const [selectedTags, setSelectedTags] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleTagChange = (tag, isChecked) => {
        if (isChecked) {
            setSelectedTags((prev) => [...prev, tag]);
        } else {
            setSelectedTags((prev) => prev.filter((t) => t !== tag));
        }
    };

    const removeTag = (tag) => {
        setSelectedTags((prev) => prev.filter((t) => t !== tag));
    };

    useEffect(() => {
        if (!query) return;

        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/search/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ query }),
                });

                if (!response.ok) {
                    console.error("Search failed");
                    return;
                }

                const data = await response.json();
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    return (
        <div className="results-content">
            <div className="left-side-results">
                <div className="filters">
                    <p>Filters</p>
                    <div className="filters-tags">
                        {selectedTags.map((tag) => (
                            <TagSelected key={tag} tag={tag} onRemove={removeTag}/>
                        ))}
                    </div>
                </div>
                <div className="tags">
                    <p>Tags</p>
                    <div className="tags-list">
                        {["Tag1", "Tag2", "Tag3", "Tag4"].map((tag) => (
                            <TagCheckBox
                                key={tag}
                                tag={tag}
                                onChange={handleTagChange}
                                isChecked={selectedTags.includes(tag)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="right-side-results">
                <div className="search-bar-results"><SearchBar initialQuery={query}/></div>
                <div className="search-results">
                    {loading ? (
                        <div className="loading-spinner">
                            <img src="/images/Loading.gif" alt="Loading..."/>
                        </div>
                    ) : (
                        documents.map((doc, index) => (
                            <div className="results">
                                <Document
                                    key={index}
                                    name={doc.document_title}
                                    previewImage={doc.preview_image}
                                    tags={doc.tags || []}
                                    text={doc.representative_text}
                                    filepath={doc.filepath}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Results;
