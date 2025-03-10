import React from 'react';
import './TagCheckBoxStyle.css';

const TagCheckBox = ({ tag, onChange, isChecked }) => {
    const handleChange = (e) => {
        onChange(tag, e.target.checked);
    };

    return (
        <div className="tag-check-box">
            <input
                id="checkboxInputOverride"
                value="1"
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
            />
            <label>{tag}</label>
        </div>
    );
};

export default TagCheckBox;