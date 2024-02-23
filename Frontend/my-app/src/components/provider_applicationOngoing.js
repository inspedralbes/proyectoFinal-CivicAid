import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';



const ApplicationOngoing = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const [error, setError] = useState(null);
    // const [isLoading, setLoading] = useState(false);
    // const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const token = localStorage.getItem('access_token');


    const userInfo = useSelector((state) => state.data?.sector);
    const isWorker = useSelector((state) => state.isWorker);
    const sector = useSelector((state) => state.data.sector);;
    // const sector = "Servicios Médicos";
    const [applicationInfo, setApplicationInfo] = useState([]);
    const applicationOngoing = useSelector((state) => state.applicationOngoingInfo);

    console.log(applicationOngoing);

    return (
        <div>
        <p>Application ID: {applicationOngoing.applicationId}</p>
        <p>Title: {applicationOngoing.title}</p>
        <p>Description: {applicationOngoing.description}</p>
        {/* Agrega más campos aquí según sea necesario */}
    </div>
    )
}

export default ApplicationOngoing;