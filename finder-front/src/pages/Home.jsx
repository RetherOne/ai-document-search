import React, { useEffect, useState } from 'react';
import './HomeStyle.css';
import SearchBar from "../components/SearchBar/SearchBar.jsx";
import Document from "../components/Document/Document.jsx";
import {DefaultVariables} from "../components/DefaultVariables.jsx";

const Home = () => {
    const [topDocs, setTopDocs] = useState([]);
    const {csrfToken}= DefaultVariables();

    useEffect(() => {
        const fetchTopDocuments = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/download/", {
                    method: "GET",
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setTopDocs(data);
                } else {
                    console.error("Ошибка загрузки топ-документов");
                }
            } catch (error) {
                console.error("Ошибка сети:", error);
            }
        };

        fetchTopDocuments();
    }, []);

    return (
        <div className="search">
            <h1 className="center-text">Finder</h1>
            <SearchBar/>
            <div className="doc-list">
                {topDocs.map((doc, index) => (
                    <Document
                        key={index}
                        docId={doc.document_id}
                        name={doc.document_title}
                        previewImage={doc.preview_image}
                        filepath={doc.filepath}
                    />
                ))}
            </div>
        </div>
    );
};

export default Home;
