import React from 'react';
import './DocumentStyle.css';
import { NavLink } from "react-router-dom";

const Document = ({ name = "Name of document", previewImage, tags = [], text = "", filepath }) => (
    <NavLink to="/document" className="document" state={{ name, text, filepath }}>
        <img src={previewImage || "/images/FirstDocPage.png"} alt="Preview" style={{ width: '248px' }} />
        <div className="doc-p">
            <p className="doc-name">{name}</p>
            <p className="doc-tags">{tags.map(tag => `#${tag} `).join(" ")}</p>
        </div>
    </NavLink>
);

export default Document;