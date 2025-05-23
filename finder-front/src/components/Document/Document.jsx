import React from 'react';
import './DocumentStyle.css';
import { NavLink } from "react-router-dom";

const Document = ({docId = null, name = "Name of document", previewImage, tags = [], text = "", filepath, showDelete = false, onDelete = () => {} }) => (
    <div className="document">
        <NavLink to="/document" state={{docId, name, text, filepath}}>
            <img src={previewImage || "/images/FirstDocPage.png"} alt="Preview"
                 style={{width: '248px', height: '320px'}}/>
            <div className="doc-p">

            </div>
        </NavLink>
        <div className="doc-footer">
            <div>
                <p className="doc-name">{name}</p>
                <p className="doc-tags">{tags.map(tag => `#${tag} `).join(" ")}</p>
            </div>
            {showDelete && (
                <button
                    className="delete-button"
                    onClick={() => onDelete(docId)}
                    title="Delete document"
                >
                    <img src="/images/Bin.png" alt="Delete" style={{width: "24px"}}/>
                </button>
            )}
        </div>

    </div>
);

export default Document;