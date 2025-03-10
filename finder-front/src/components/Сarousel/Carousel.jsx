import React from 'react';
import './СarouselStyle.css';
import Document from "../Document/Document.jsx";
import {NavLink} from "react-router-dom";

const Carousel = ({name = "Name of category"}) => {
    return (
        <div className="all-categories">
            <div className="name-see-all"><p className="name">{name}</p> <NavLink to="/all/more" state={{ name }} className="see">see more...</NavLink>
            </div>
            <div className="all-documents">
                <img src="/images/ChevronLeft.png" alt="X"/>
                <Document name="The Catcher in the Rye"/>
                <Document name="Pride and Prejudice" />
                <Document name="The Catcher in the Rye" />
                <img src="/images/ChevronRight.png" alt="X"/>
            </div>
        </div>
    );
}

export default Carousel;
