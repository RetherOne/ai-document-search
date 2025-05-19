import Document from "../../components/Document/Document.jsx";
import React, {useState, useEffect} from 'react';
import styles from './AllDocuments.module.css';

const AllDocuments = () => {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/all-docs/", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setDocuments(data); // где setResults — useState для отображения документов
            });
    }, []);

    return(
    <div className={styles.mainAll}>
        <p className={styles.text}>All published documents</p>
        <div className={styles.allCenter}>
            {documents.map((doc) => (
                <Document
                    key={doc.document_id}
                    docId={doc.document_id}
                    name={doc.document_title}
                    previewImage={doc.preview_image}
                    filepath={doc.filepath}
                />
            ))}
        </div>
    </div>
)};


export default AllDocuments;
