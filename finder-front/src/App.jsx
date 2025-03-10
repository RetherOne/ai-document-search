import {useEffect, useState} from "react";
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import Header from "./components/Header/Header.jsx";
import Home from "./pages/Home.jsx";
import Results from "./pages/Results/Results.jsx";
import DocPage from "./pages/DocPage/DocPage.jsx";
import SingIn from "./pages/SingIn/SingIn.jsx";
import Register from "./pages/Register/Register.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Upload from "./pages/Upload/Upload.jsx";
import AllDocuments from "./pages/AllDocuments/AllDocuments.jsx";
import About from "./pages/About/About.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import MoreDocuments from "./pages/MoreDocuments/MoreDocuments.jsx";

function App() {
    const [authorization, setAuthorization] = useState(false);
    const [username, setUsername] = useState("Unauthorized");

    useEffect(() => {
        console.log('Authorization state changed:', authorization);
    }, [authorization]);


    return (
        <BrowserRouter>
            <div className="main-app">
                <ScrollToTop />
                <Header authorization={authorization} setAuthorization={setAuthorization} setUsername={setUsername}/>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/result" element={<Results />} />
                    <Route path="/document" element={<DocPage authorization={authorization} />} />
                    <Route path="/singin" element={<SingIn authorizationSeter={setAuthorization} setUsername={setUsername} />} />
                    <Route path="/register" element={<Register authorizationSeter={setAuthorization} setUsername={setUsername} />} />
                    <Route path="/profile" element={<Profile setAuthorization={setAuthorization} username={username}/>} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/all" element={<AllDocuments />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/all/more" element={<MoreDocuments />} />

                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
