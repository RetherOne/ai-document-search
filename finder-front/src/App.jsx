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
    const [isAuthenticated, setAuthorization] = useState(false);
    const [username, setUsername] = useState("Unauthorized");
    const [csrfToken, setCsrfToken] = useState("none");

    useEffect(() => {
        console.log('Authorization state changed:', isAuthenticated);
    }, [isAuthenticated]);

    useEffect(() => {
        console.log(csrfToken);
    }, [csrfToken]);

    const getCsrfToken = () => {
        fetch("http://localhost:8000/api/csrf/", {
            credentials: "include",
        })
            .then((res) => {
                setCsrfToken(res.headers.get("X-CSRFToken"));
                console.log(csrfToken);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const getSession = () => {
        fetch("http://localhost:8000/api/session/", {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                if (data.isAuthenticated) {
                    console.log(data);
                    setAuthorization(true);
                    setUsername(data.username);
                } else {
                    setAuthorization(false);
                    getCsrfToken();
                }
            })
            .catch(err => console.error("Session error:", err));
    };

    useEffect(() => {
        getSession();
    }, []);


    return (
        <BrowserRouter>
            <div className="main-app">
                <ScrollToTop />
                <Header authorization={isAuthenticated} setAuthorization={setAuthorization} setUsername={setUsername} getCsrfToken={getCsrfToken}/>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/result" element={<Results />} />
                    <Route path="/document" element={<DocPage authorization={isAuthenticated} />} />
                    <Route path="/singin" element={<SingIn authorizationSeter={setAuthorization} setUsername={setUsername} csrfToken={csrfToken}/>} />
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
