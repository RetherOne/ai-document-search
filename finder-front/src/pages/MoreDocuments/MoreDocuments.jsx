import React, {useState} from 'react';
import './MoreDocumentsStyle.css';
import TagSelected from "../../components/Tags/TagSelected.jsx";
import TagCheckBox from "../../components/Tags/TagCheckBox.jsx";
import Document from "../../components/Document/Document.jsx";
import {useLocation} from "react-router-dom";

const MoreDocuments = () => {
    const [selectedTags, setSelectedTags] = useState([]);
    const location = useLocation();
    const name = location.state?.name || "Name of categories";


    const handleTagChange = (tag, isChecked) => {
        if (isChecked) {
            setSelectedTags((prev) => [...prev, tag]);
        } else {
            setSelectedTags((prev) => prev.filter((t) => t !== tag));
        }
    };

    const removeTag = (tag) => {
        setSelectedTags((prev) => prev.filter((t) => t !== tag));
    };

    return (
        <div className="results-content">
            <div className="left-side-results">
                <div className="filters">
                    <p>Filters</p>
                    <div className="filters-tags">
                        {selectedTags.map((tag) => (
                            <TagSelected key={tag} tag={tag} onRemove={removeTag}/>
                        ))}
                    </div>
                </div>
                <div className="tags">
                    <p>Tags</p>
                    <div className="tags-list">
                        {["Tag1", "Tag2", "Tag3", "Tag4"].map((tag) => (
                            <TagCheckBox
                                key={tag}
                                tag={tag}
                                onChange={handleTagChange}
                                isChecked={selectedTags.includes(tag)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="search-results more">
                <div className="name">{name}</div>
                <div className="results">
                    <Document name="In Search of Lost Time"/>
                    <Document name="One Hundred Years of Solitude"/>
                    <Document name="The Catcher in the Rye"/>
                    <Document name="Nineteen Eighty Four"/>
                    <Document name="Anna Karenina"/>
                    <Document name="To Kill a Mockingbird" />
                    <Document name="1984" />
                    <Document name="The Great Gatsby" />
                    <Document name="Pride and Prejudice" />
                    <Document name="The Catcher in the Rye" />
                    <Document name="Moby Dick" />
                    <Document name="The Hobbit" />
                </div>
            </div>
        </div>
    );
}

export default MoreDocuments;
