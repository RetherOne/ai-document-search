import React, {useEffect, useState} from "react";
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
    const {isAuthenticated} = DefaultVariables();
    const location = useLocation();
    const {name = "Name of document", text = "", filepath = ""} = location.state || {};
    const [isSaved, setIsSaved] = useState(false);
    const relativePath = filepath.replace("/media/", "");
    const downloadUrl = `http://127.0.0.1:8000/api/download/${relativePath}`;

    const handleSave = () => {
        if (isAuthenticated){
            setIsSaved(!isSaved);
            alert("Saved successfully");
        }
        else{
            alert("You must be logged in!");
        }
    };
    const handleReport = () => {
        alert("Report successfully");
    };

    useEffect(() => {
        console.log(location.state);
    }, []);

    return (
        <div className="doc-page">
            <div className="left-side-doc">

                    <p className="p-name">{name}</p>
                    <p className="p-description">Description..........................................................................................................................</p>

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
                        <a className="doc-operation-but" href={downloadUrl} download={name}>
                            <img src="/images/Download.png" alt="Download img"/>
                            <p>Download</p>
                        </a>
                        <button className="doc-operation-but" onClick={handleSave}>
                            <img src={isSaved ? "/images/Bookmark_saved.png" : "/images/Bookmark.png"}
                                 alt={isSaved ? "Saved img" : "Save img"}/>
                            {isSaved ? "Saved" : "Save"}
                        </button>
                        <button className="doc-operation-but" style={{padding: "12px"}} onClick={handleReport}>
                            <img src="/images/Alert.png" alt="Save img"/>
                            Report
                        </button>
                    </div>
                </div>

            </div>

            <div className="main-part-doc">
                <PDFViewer fileUrl={`http://127.0.0.1:8000${filepath}`} />
            </div>

        </div>
    );
};

export default DocPage;
