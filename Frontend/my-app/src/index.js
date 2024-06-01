import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './components/store';
import socketIO from 'socket.io-client';

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
import WorkerProfile from './pages/workerProfile';
import AdminProfile from './pages/adminProfile';

import HacerSolicitud from './pages/makeApplication';
import GestionarSolicitudes from './pages/manageApplication';
import SolicitudAceptada from './pages/applicationOngoing';
import SolicitudPropia from './pages/getOwnApplication';

import GestionarSolicitudesRegistro from './pages/signinRequests';
import AsignarSolicitud from './pages/assignApplication';

import './App.css';

let socket = socketIO(process.env.REACT_APP_NODE_URL, {
    withCredentials: true,
    cors: {
        origin: "*",
        credentials: true,
    },
    path: "/node/",
    reconnection: true,            // Habilita la reconexión automática
    reconnectionAttempts: Infinity, // Número máximo de intentos de reconexión
    reconnectionDelay: 1000,        // Tiempo de espera inicial antes de intentar reconectar (ms)
    reconnectionDelayMax: 5000,     // Tiempo máximo de espera entre intentos de reconexión (ms)
    randomizationFactor: 0.5        // Factor de aleatorización para los tiempos de espera de reconexión
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage socket={socket} />} />
                    <Route path="/login" element={<LoginUsuario />} />
                    <Route path="/loginWorker" element={<LoginWorker />} />
                    <Route path="/loginAdmin" element={<LoginAdmin />} />
                    <Route path="/signin" element={<SigninUsuario />} />
                    <Route path="/signinWorker" element={<SigninWorker />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/workerProfile" element={<WorkerProfile />} />
                    <Route path="/adminProfile" element={<AdminProfile />} />

                    <Route path="/makeApplication" element={<HacerSolicitud />} />
                    <Route path="/manageApplications" element={<GestionarSolicitudes socket={socket} />} />
                    <Route path="/applicationOngoing" element={<SolicitudAceptada socket={socket} />} />
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
