import React from 'react';
import './DocumentStyle.css';
import {NavLink} from "react-router-dom";

const Document = ({name = "Name of document"}) => (
    <NavLink to="/document" className="document" state={{ name }}>
        <img src="/images/FirstDocPage.png" alt="First page" style={{ width: '248px'}} />
        <div className="doc-p">
            <p className="doc-name">{name}</p>
            <p className="doc-tags">#tag #tag #tag</p>
        </div>
    </NavLink>
);


export default Document;
