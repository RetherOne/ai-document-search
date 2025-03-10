import React, {useState} from "react";
import './DocPageStyle.css';
import A4 from "../../components/A4/A4.jsx";
import {useLocation} from "react-router-dom";

const DocPage = ({authorization = false}) => {
    const location = useLocation();
    const name = location.state?.name || "Name of document";
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        if (authorization){
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
                        <a className="doc-operation-but" href="/documents/Doc1.pdf" download="document.pdf">
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
                <A4/>
                <A4/>
                <A4/>
            </div>

        </div>
    );
};

export default DocPage;
