import React, {useEffect, useState, useRef} from "react";
import './DocPageStyle.css';
import {useLocation} from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {DefaultVariables} from "../../components/DefaultVariables.jsx";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();


const PDFViewer = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };
    console.log(fileUrl)
    return (
        <div className="pdf-viewer">
            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from({ length: numPages }, (_, i) => (
                    <div
                        key={i + 1}
                        style={{
                            marginBottom: i + 1 === numPages ? 0 : '30px',
                        }}
                    >
                        <Page pageNumber={i + 1} width={800}/>
                    </div>
                ))}
            </Document>
        </div>
    );
};

const DocPage = () => {
    const {isAuthenticated, csrfToken} = DefaultVariables();
    const location = useLocation();
    const {docId = null, name = "Name of document", text = "", filepath = ""} = location.state || {};
    const [isSaved, setIsSaved] = useState(false);
    const [isOwner, setIsOwner] = useState(true);
    const [loading, setLoading] = useState(false);

    const [owner, setOwner] = useState("");


    const useThrottle = () => {
        const throttleSeed = useRef(null);

        const throttleFunction = useRef((func, delay=200) => {
            if (!throttleSeed.current) {
                func();
                throttleSeed.current = setTimeout(() => {
                    throttleSeed.current = null;
                }, delay);
            }
        });

        return throttleFunction.current;
    };

    const toggleSave = async () => {
        if (loading || !isAuthenticated) return;

        setLoading(true);
        setIsSaved(!isSaved);

        const res = await fetch("http://localhost:8000/api/doc-page/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({ document_id: docId }),
        });

        const data = await res.json();
        if (data.status === "saved") {
            setIsSaved(true);
        } else if (data.status === "removed") {
            setIsSaved(false);
        }
        setLoading(false);
    };

    const throttleSave = useThrottle(1000);

    const handleSaveClick = () => {
        throttleSave(toggleSave);
    };

    const handleDownload = async () => {
        const res = await fetch("http://localhost:8000/api/download/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({ document_id: docId }),
        })

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
    };

    const throttleDownload = useThrottle(1000);

    const handleDownloadClick = () => {
        throttleDownload(handleDownload);
    };

    useEffect(() => {

        fetch(`http://localhost:8000/api/doc-page/?document_id=${docId}`, {
            method: "GET",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
        })
            .then((response) => response.json())
            .then((data) => {
                setOwner(data.owner_username)
                if (data.status === "owner") {
                    setIsOwner(true);
                    setIsSaved(false);
                } else {
                    setIsOwner(false);
                    setIsSaved(data.status);
                }
            });


    }, []);

    return (
        <div className="doc-page">
            <div className="left-side-doc">

                    <p className="p-name">{name}</p>
                    <p className="p-description">Published by: {owner}</p>

                <div className="div-tags">
                    <p className="p-tag">#Tag</p>
                    <p className="p-tag">#Tag</p>
                    <p className="p-tag">#Tag</p>
                    <p className="p-tag">#Tag</p>
                    <p className="p-tag">#Tag</p>
                </div>

                <div className="div-operations-main">
                    <p className="p-operations">Operations</p>
                    <div className="div-operations">
                        <button className="doc-operation-but" onClick={handleDownloadClick}>
                            <img src="/images/Download.png" alt="Download img"/>
                            <p>Download</p>
                        </button>
                        {!isOwner && isAuthenticated && (
                            <button className="doc-operation-but" onClick={handleSaveClick} disabled={loading}>
                                <img src={isSaved ? "/images/Bookmark_saved.png" : "/images/Bookmark.png"}
                                     alt={isSaved ? "Saved img" : "Save img"}/>
                                {isSaved ? "Saved" : "Save"}
                            </button>)}
                        <button className="doc-operation-but" style={{padding: "12px"}}>
                            <img src="/images/Alert.png" alt="Save img"/>
                            Report
                        </button>
                    </div>
                </div>

            </div>

            <div className="main-part-doc">
                <PDFViewer fileUrl={`http://localhost:8000${filepath}`} />
            </div>

        </div>
    );
};

export default DocPage;
