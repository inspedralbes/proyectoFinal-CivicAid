import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router } from 'react-router-dom';
import { Routes, Route } from "react-router-dom";
import HomePage from './pages/home';
import LoginUsuario from './pages/loginUsuario';
import LoginWorker from './pages/loginWorker';
import SigninUsuario from './pages/signinUsuario';
import SigninWorker from './pages/signinWorker';
import UserProfile from './pages/userProfile';

import HacerSolicitud from './pages/makeApplication';
import GestionarSolicitud from './pages/manageApplication';


import './App.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginUsuario />} />
                    <Route path="/loginWorker" element={<LoginWorker />} />
                    <Route path="/signin" element={<SigninUsuario />} />
                    <Route path="/signinWorker" element={<SigninWorker />} />
                    <Route path="/profile" element={<UserProfile />} />

                    <Route path="/makeApplication" element={<HacerSolicitud />} />
                    <Route path="/manageApplication" element={<GestionarSolicitud />} />
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
