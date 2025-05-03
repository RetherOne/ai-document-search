import React, { useRef, useState } from 'react';
import './SearchBarStyle.css';
import {Button, Form, Input, TextField} from "react-aria-components";
import {useNavigate} from "react-router-dom";
import {DefaultVariables} from "../DefaultVariables.jsx";


const SearchBar = ({ initialQuery = "" }) => {
    const [query, setQuery] = useState(initialQuery);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const {csrfToken}= DefaultVariables();

    const handleSearch = async (event) => {
        event.preventDefault();
        const query = event.target['text-to-search'].value;
        navigate(`/result?query=${encodeURIComponent(query)}`);
        const response = await fetch("http://localhost:8000/api/search/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
                "Content-Type": "application/json",
            },
            body:  JSON.stringify({ query }),
            credentials: "include",
        })
        const data = await response.json();
        console.log(data)
    };

    return (
        <Form className="center-search-bar" name="searchForm" onSubmit={handleSearch}>
            <TextField className="text-cross" aria-label="search">
                <Input className="input-bar"
                       ref={inputRef}
                       type="text" name="text-to-search" placeholder="Enter query"
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                />
                {query.length > 0 && <img src="/images/X.png" alt="Cross" className="cross" style={{ width: '18px', height: '18px'}} onClick={() => {
                    setQuery("");
                    inputRef.current.focus();
                    }
                }/>}
            </TextField>
            <Button className="search-button" type="submit">Search</Button>
        </Form>
    )
};

export default SearchBar;
