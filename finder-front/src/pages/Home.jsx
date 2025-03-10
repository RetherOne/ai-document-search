import React from 'react';
import './HomeStyle.css';
import SearchBar from "../components/SearchBar/SearchBar.jsx";
import Document from "../components/Document/Document.jsx";

const Home = () => {
    return(
        <div className="search">
            <h1 className="center-text">Finder</h1>
            <SearchBar/>
            <div className="doc-list">
                <Document name="In Search of Lost Time"/>
                <Document name="One Hundred Years of Solitude"/>
                <Document name="The Catcher in the Rye"/>
                <Document name="Nineteen Eighty Four"/>
                <Document name="Anna Karenina"/>
            </div>
        </div>
    )
};


export default Home;
