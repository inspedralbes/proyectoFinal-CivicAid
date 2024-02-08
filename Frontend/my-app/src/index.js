import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router } from 'react-router-dom';
import { Routes, Route } from "react-router-dom";
import HomePage from './pages/home';
import HacerSolicitud from './pages/makeApplication';
import LoginUsuario from './pages/loginUsuario';
import LoginWorker from './pages/loginWorker';
//A ESTE ERROR NO HACERLE CASO
import SigninUsuario from './pages/signinUsuario';
import SigninWorker from './pages/signinWorker';
import UserProfile from './pages/userProfile';



import './App.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/makeApplication" element={<HacerSolicitud />} />
                    <Route path="/login" element={<LoginUsuario />} />
                    <Route path="/loginWorker" element={<LoginWorker />} />
                    <Route path="/signin" element={<SigninUsuario />} />
                    <Route path="/signinWorker" element={<SigninWorker />} />
                    <Route path="/profile" element={<UserProfile />} />


                    {/* <Route path="/games" element={<Games sharedValue={sharedValue} onSharedValueChange={handleSharedValueChange} sharedId={sharedId} onSharedIdChange={handleSharedIdChange} />} />
                    <Route path="/upload" element={<Upload socket={socket} />} />
                    <Route path="/update" element={<Update socket={socket} />} />
                    <Route path="/profile" element={<Profile socket={socket} />} />
                    <Route path="/otherProfile" element={<OtherProfile sharedValue={sharedValue} onSharedValueChange={handleSharedValueChange} sharedId={sharedId} onSharedIdChange={handleSharedIdChange} />} />
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/game" element={<Game socket={socket} sharedValue={sharedValue} sharedId={sharedId} />} />
                    <Route path="/ranking" element={<GetRanking />} />
                    <Route path="/store" element={<GetGameStore />} />
                    <Route path="/guide" element={<Guide />} /> */}
                </Routes>
                {/* <HomePage /> */}
            </Router>
        </div>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a functionx
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
