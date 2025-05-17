import React, { useEffect, useState } from 'react';
import './ProfileStyle.css';
import {DefaultVariables} from "../../components/DefaultVariables.jsx";
import Document from "../../components/Document/Document.jsx";

const Profile = () => {
    const {setAvatarUrl, username, csrfToken, avatarUrl}= DefaultVariables();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);


    const toggleUploadForm = () => {
        setSelectedFile(null);
        setShowUploadForm(!showUploadForm);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
        else{
            setSelectedFile(null);
        }
    };

    const handleUploadSubmit = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        fetch("http://localhost:8000/api/set-profile-data/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: formData,
        }).then(response => response.json())
            .then(data => {
                setAvatarUrl(data.avatar);
                setShowUploadForm(false);
                setSelectedFile(null);
            }).catch(error => {
            console.error("Error uploading file:", error);
        });
    };

    useEffect(() => {
        fetch("http://localhost:8000/api/get-user-docs/", {
            method: "GET",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => {
                setDocuments(data.files);
                setLoading(false);
            })
            .catch(error => {
                console.error("error get file:", error);
                setLoading(false);
            });
    }, []);

    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    return (
        <div className="singin-main" style={{paddingTop: "40px", paddingBottom: "40px"}}>
            <div className="profile-center">
                {!showUploadForm ? (
                    <img
                        src={avatarUrl === "avatarUrl None" || !avatarUrl ? "/images/user.jpg" : `http://localhost:8000${avatarUrl}`}
                        alt="profile"
                        style={{ width: '350px' }}
                    />
                ) : (
                    <div
                        className={`drop-zone ${dragActive && 'dragging'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            width: '350px',
                            height: '350px',
                        }}
                    >
                        {!selectedFile ? (
                            <div>
                                <p style={{
                                    fontSize: "45px",
                                    fontWeight: "700",
                                    color: "#1E1E1E"
                                }}>Click here</p>

                                <p style={{
                                    fontSize: "28px",
                                    fontWeight: "400"
                                }}>Or drag the image into this area</p>

                                <p style={{marginTop: "48px"}}>
                                    Supported formats: <span style={{color: "#000000"}}>.jpg</span>, <span
                                    style={{color: "#000000"}}>.png</span>
                                </p>
                                <input
                                    type="file"
                                    accept=".jpg,.png"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="file-input"
                                />
                            </div>
                        ) : (

                            <img
                                src={previewUrl}
                                alt="preview"
                                style={{ width: '350px'}}
                            />

                        )}

                    </div>
                )}
                <div className="profile-text">
                    <p className="username">{username}</p>
                    <p>E-mail : example@example.com</p>
                    <p>Phone number : +1112223334</p>
                    <p>Address : Example st., 666</p>
                    <div className="profile-button">
                        {showUploadForm && (
                            <button onClick={handleUploadSubmit} className="singin upload-button">
                                Submit
                            </button>
                        )}

                        <button onClick={toggleUploadForm} className="register">
                            {showUploadForm ? "Cancel" : "Change Avatar"}
                        </button>
                    </div>

                </div>
            </div>
            <p className="doc-text">Your documents:</p>
            <div className="users-docs">
            {loading ? (
                    <div className="loading-spinner">
                        <img src="/images/Loading.gif" alt="Loading..."/>
                    </div>
                ) : (
                    documents.map((doc, index) => (
                        <div className="results" key={index}>
                            <Document
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
    )
}


export default Profile;
