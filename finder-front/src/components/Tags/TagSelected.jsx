import React from 'react';
import './TagSelectedStyle.css';

const TagSelected = ({ tag, onRemove }) => {
    return (
        <div className="tag-selected">
            <p>{tag}</p>
            <span
                className="remove-tag"
                onClick={() => onRemove(tag)}
                style={{
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <img src="/images/X.png" alt="Cross" style={{ width: '16px', height: '16px'}}/>
            </span>
        </div>
    );
};

export default TagSelected;
