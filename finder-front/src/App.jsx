import {useEffect} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
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
import Saved from "./pages/Saved/Saved.jsx";
import { DefaultVariables } from "./components/DefaultVariables.jsx";
import './App.css'


function App() {
    const {setAuthorization, setUsername,setAvatarUrl, csrfToken, setCsrfToken}= DefaultVariables();

    const getCsrfToken = () => {
        fetch("http://localhost:8000/api/csrf/", {
            credentials: "include",
        })
            .then((res) => {
                setCsrfToken(res.headers.get("X-CSRFToken"));
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
                    setAuthorization(data.isAuthenticated);
                    setUsername(data.username);
                    setAvatarUrl(data.avatar)
                } else {
                    setAuthorization(false);
                }
                getCsrfToken();
            })
            .catch(err => console.error("Session error:", err));
    };

    useEffect(() => {
        // console.log("TokenA:", csrfToken);
        getSession();
    }, []);


    return (
        <BrowserRouter>
            <div className="main-app">
                <ScrollToTop />
                <Header />
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/result" element={<Results />} />
                    <Route path="/document" element={<DocPage />} />
                    <Route path="/singin" element={<SingIn />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/all" element={<AllDocuments />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
