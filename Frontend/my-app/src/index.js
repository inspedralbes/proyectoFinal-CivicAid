import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './components/store';

import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router } from 'react-router-dom';
import { Routes, Route } from "react-router-dom";
import HomePage from './pages/home';
import LoginUsuario from './pages/loginUsuario';
import LoginWorker from './pages/loginWorker';
import LoginAdmin from './pages/loginAdmin';
import SigninUsuario from './pages/signinUsuario';
import SigninWorker from './pages/signinWorker';
import UserProfile from './pages/userProfile';

import HacerSolicitud from './pages/makeApplication';
import GestionarSolicitudes from './pages/manageApplication';
import SolicitudAceptada from './pages/applicationOngoing';
import SolicitudPropia from './pages/getOwnApplication';

import GestionarSolicitudesRegistro from './pages/signinRequests';
import AsignarSolicitud from './pages/assignApplication';



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
                        <Route path="/loginAdmin" element={<LoginAdmin />} />
                        <Route path="/signin" element={<SigninUsuario />} />
                        <Route path="/signinWorker" element={<SigninWorker />} />
                        <Route path="/profile" element={<UserProfile />} />

                        <Route path="/makeApplication" element={<HacerSolicitud />} />
                        <Route path="/manageApplications" element={<GestionarSolicitudes />} />
                        <Route path="/applicationOngoing" element={<SolicitudAceptada />} />
                        <Route path="/ownApplication" element={<SolicitudPropia />} />

                        <Route path="/manageSigninRequests" element={<GestionarSolicitudesRegistro />} />
                        <Route path="/assignApplications" element={<AsignarSolicitud />} />

                    </Routes>
                </Router>
            </div>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a functionx
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
