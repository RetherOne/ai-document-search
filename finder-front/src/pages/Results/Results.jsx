import React, { useState, useEffect } from "react";
import './ResultsStyle.css';
import { useLocation } from 'react-router-dom';
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import Document from "../../components/Document/Document.jsx";

const Results = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <div className="right-side-results">
                <div className="search-bar-results"><SearchBar initialQuery={query}/></div>
                <div className="search-results">
                    {loading ? (
                        <div className="loading-spinner">
                            <img src="/images/Loading.gif" alt="Loading..."/>
                        </div>
                    ) : (
                        documents.map((doc, index) => (
                            <div className="results" key={index}>
                                <Document
                                    docId={doc.document_id}
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
