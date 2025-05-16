import React, { useEffect, useState } from 'react';
import './UploadStyle.css';
import { DefaultVariables } from "../../components/DefaultVariables.jsx";

const Upload = () => {
    const { csrfToken } = DefaultVariables();

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [isPublic, setIsPublic] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const uploadedFile = e.dataTransfer.files[0];
        validateFile(uploadedFile);
    };

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        validateFile(uploadedFile);
    };

    const validateFile = (uploadedFile) => {
        const allowedFormats = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!uploadedFile) return;

        if (!allowedFormats.includes(uploadedFile.type)) {
            alert("Only .doc, .docx, and .pdf files are allowed.");
            return;
        }

        setFile(uploadedFile);
        console.log("File selected:", uploadedFile);
    };

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('is_public', isPublic);  // отправка статуса публичности

        fetch("http://localhost:8000/api/upload/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: formData,
        }).then(response => {
            if (response.ok) {
                console.log("File uploaded successfully");
                alert("Файл успешно загружен");
                setFile(null); // Очистка
            } else {
                console.log("Upload failed");
                alert("Не удалось загрузить файл");
            }
        }).catch(error => {
            console.error("Error uploading file:", error);
            alert("Ошибка загрузки файла");
        });
    };

    useEffect(() => {
        console.log("TokenU:", csrfToken);
    }, [csrfToken]);

    return (
        <div className="upload-page">
            <div
                className={`drop-zone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {file ? (
                    <p style={{
                        fontSize: "32px",
                        fontWeight: "400",
                        color: "#00c300"
                    }}>Selected file: {file.name}</p>
                ) : (
                    <>
                        <p style={{
                            fontSize: "72px",
                            fontWeight: "700",
                            color: "#1E1E1E"
                        }}>Click here</p>

                        <p style={{
                            fontSize: "32px",
                            fontWeight: "400"
                        }}>Or drag the document into this area</p>

                        <p style={{ marginTop: "48px" }}>
                            Supported formats: <span style={{ color: "#000000" }}>.docx</span>, <span style={{ color: "#000000" }}>.pdf</span>
                        </p>
                    </>
                )}
                <input
                    type="file"
                    className="file-input"
                    accept=".doc,.docx,.pdf"
                    onChange={handleFileChange}
                />
            </div>

            {file && (
                <div style={{ marginTop: "24px", textAlign: "center", display: "flex",flexDirection: "column", alignItems: "center" }}>
                    <label style={{ fontSize: "18px", marginRight: "12px" }}>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={() => setIsPublic(!isPublic)}
                            style={{ marginRight: "8px" }}
                        />
                        The file is public
                    </label>

                    <div style={{ marginTop: "16px" }}>
                        <button onClick={handleUpload} className="singin upload-button active">
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
