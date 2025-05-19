import React, {useState, useEffect} from 'react';
import styles from './Saved.module.css';
import Document from "../../components/Document/Document.jsx";
import {DefaultVariables} from "../../components/DefaultVariables.jsx";


const Saved = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const {isAuthenticated, csrfToken} = DefaultVariables();

    const savedCheck =() => {
        fetch("http://localhost:8000/api/saved-docs/", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setDocuments(data);
                setLoading(false);
                console.log(data);
            })
            .catch(() => {
                setLoading(false);
            });
    }
    const handleDelete = async (id) => {
        if (!isAuthenticated) return;
        await fetch("http://localhost:8000/api/doc-page/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({ document_id: id }),
        });
        savedCheck()
    };

    useEffect(() => {
        savedCheck()
    }, []);

    return(
        <div className={styles.main}>
            <h1 className={styles.text}>Your saved docs:</h1>
            <div className={styles.saved}>
                {loading ? (
                    <img src="/images/Loading.gif" alt="Loading..."/>
                ) : documents.length > 0 ? (
                    documents.map((doc, index) => (
                        <div className="results" key={index}>
                            <Document
                                docId={doc.id}
                                name={doc.title}
                                previewImage={doc.preview}
                                filepath={doc.pdf_file}
                                showDelete={true}
                                onDelete={(id) => handleDelete(id)}
                            />
                        </div>
                    ))
                ) : (
                    <p>Empty</p>
                )}
            </div>
        </div>
    )
}

export default Saved;