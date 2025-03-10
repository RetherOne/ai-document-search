import React, { useState } from 'react';
import './UploadStyle.css';

const Upload = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);

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
        setFile(uploadedFile);
        console.log("File dropped:", uploadedFile);
    };

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];

        if (uploadedFile) {
            const allowedFormats = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedFormats.includes(uploadedFile.type)) {
                alert("Only .doc, .docx, and .pdf files are allowed.");
                e.target.value = ""; // Сбрасываем выбор файла
                return;
            }
            setFile(uploadedFile);
            console.log("File selected:", uploadedFile);
        }

    };

    return (
        <div className="upload-page">
            <div
                className={`drop-zone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {file ? (
                    <p style={{ fontSize: "32px",
                                fontWeight: "400",
                                color: "#00c300"}}>The file was downloaded successfully.</p>
                ) : (
                    <>
                        <p style={{ fontSize: "72px",
                                    fontWeight: "700",
                                    color: "#1E1E1E"}}>Click here</p>

                        <p style={{ fontSize: "32px",
                                    fontWeight: "400"}}>Or drag the document into this area</p>

                        <p style={{marginTop: "48px",}}>Supported formats: <span style={{color: "#000000"}}>*.docx</span>, <span style={{color: "#000000"}}>*.pdf</span></p>
                    </>
                )}
                <input
                    type="file"
                    className="file-input"
                    accept=".doc,.docx,.pdf"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
export default Upload;
