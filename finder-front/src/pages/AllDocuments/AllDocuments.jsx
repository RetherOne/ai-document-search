import React from 'react';
import './AllDocumentsStyle.css';
import Carousel from "../../components/Сarousel/Carousel.jsx";

const AllDocuments = () => (
    <div className="main-all">
        <div className="all-center">
            <Carousel name="Legal"/>
            <Carousel name="Finance"/>
            <Carousel name="Books"/>
        </div>
    </div>
);


export default AllDocuments;
