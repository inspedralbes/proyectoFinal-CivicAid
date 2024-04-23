import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';

import Swal from "sweetalert2";

const ManageApplication = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const token = localStorage.getItem('access_token');

    const workerId = useSelector((state) => state.data?.id);
    const isWorker = useSelector((state) => state.isWorker);
    const sector = useSelector((state) => state.data.sector);
    const [applicationInfo, setApplicationInfo] = useState([]);
    const applicationOngoingInfo = useSelector((state) => state.applicationOngoingInfo.id);
    const checkAppOngoing = useSelector((state) => state.applicationOngoing);


    useEffect(() => {
        async function fetchApplications() {

            console.log("SOLICITUD EN MARCHA:", applicationOngoingInfo);
            if (isWorker) {
                try {
                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listAssignedApplications', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ workerId }),
                    });
                    const data = await response.json();
                    console.log("ASSIGNED: ", data);

                    setApplicationInfo(data)

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                }
            }
        }
        fetchApplications();
    }, [applicationOngoingInfo]);


    const handleApplication = async (e) => {
        // e.preventDefault(e);
        setLoading(true);

        if (checkAppOngoing) {
            // Mostrar el modal
            setShowModal(true);
        } else {
            try {
                let applicationStatus = e.applicationStatus = "active";

                const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateApplicationStatus/${e.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ applicationStatus, workerId }),
                });

                const data = await response.json();

                console.log(data);

            } catch (error) {
                console.error("ESTE ES EL ERROR: ", error);
            }

            // navigate("/");
            dispatch(actions.applicationOngoing(e))
        }

    }


    const updateAppOngoing = async (e) => {
        // e.preventDefault(e);
        setLoading(true);
        setShowModal(false);

        try {
            //PRIMER FETCH PARA PONER LA SOLICITUD VIEJA EN INACTIVA 
            const applicationStatus = "inactive";

            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateApplicationStatus/${applicationOngoingInfo}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationStatus }),
            });
            const data = await response.json();
            console.log("PRIMER STATUS: ", data);

        } catch (error) {
            console.error("ERROR EN EL PRIMER FETCH: ", error);
        }

        try {
            //SEGUNDO FETCH PARA PONER LA SOLICITUD NUEVA EN ACTIVA 
            const applicationStatus = "active";
            const response2 = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateApplicationStatus/${e.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationStatus }),
            });
            const data2 = await response2.json();
            console.log("SEGUNDO STATUS: ", data2);

            navigate("/");
            dispatch(actions.applicationOngoing(e))

        } catch (error) {
            console.error("ERROR EN EL SEGUNDO FETCH: ", error);

        }
    }

    return (
        <main className='min-h-screen bg-gray-100 items-center justify-center'>
            {isWorker ? (
                <div>
                    
                    {applicationInfo.map((application, id) => {
                        // No renderizar el div si la condición se cumple
                        if (applicationOngoingInfo === application.id || application.applicationStatus === 'completed') {
                            return null;
                        }
                        return (
                            <div key={id} className="relative flex w-full max-w-[26rem] p-5 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg">
                                {/* Contenido de la solicitud */}
                                <div className="relative mx-4 mt-4 overflow-hidden text-white shadow-lg rounded-xl bg-blue-gray-500 bg-clip-border shadow-blue-gray-500/40">
                                    <img src="https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="Imagen de ejemplo" />
                                    <div className="absolute inset-0 w-full h-full to-bg-black-10 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="block font-sans text-xl antialiased font-medium leading-snug tracking-normal text-blue-gray-900">{application.title}</h5>
                                    </div>

                                    <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                        SOLICITANTE: {application.applicantId}
                                    </p>

                                    <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                        {application.description}
                                    </p>

                                    <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                        {application.applicationStatus}
                                        
                                    </p>
                                </div>
                                <div className="p-6 pt-3">
                                    <button
                                        onClick={() => handleApplication(application)}
                                        className="block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                        type="submit">
                                        ACEPTAR
                                    </button>
                                </div>
                                {
                                    showModal && (
                                        <div className="fixed z-10 inset-0 overflow-y-auto">
                                            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                                </div>

                                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                                        <div className="sm:flex sm:items-start">
                                                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                                {/* Icono de advertencia */}
                                                                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                </svg>
                                                            </div>
                                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Solicitud en curso</h3>
                                                                <div className="mt-2">
                                                                    <p className="text-sm text-gray-500">
                                                                        Tienes una solicitud en curso. ¿Quieres sustuirla por la que tienes por una nueva solicitud?
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                                        <button onClick={() => updateAppOngoing(application)} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                                            Proceder
                                                        </button>
                                                        <button onClick={() => setShowModal(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        );
                    })}

                </div>


            ) : (
                <div className="p-10 text-center bg-gray-800 text-white font-bold rounded-lg">
                    <p className="mb-6 text-lg lg:text-2xl sm:px-16 xl:px-48 dark:text-gray-400">
                        NO HAS INICIADO SESIÓN
                    </p>
                    <p className="mb-6 text-lg lg:text-2xl sm:px-16 xl:px-48 dark:text-gray-400">
                        Debes iniciar sesión para poder acceder a esta parte de la página
                    </p>
                    <div className='flex justify-center uppercase'>
                        <NavLink to="/login" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-purple-800 rounded-lg hover:bg-purple-900">
                            INICIAR SESIÓN
                        </NavLink>
                        <NavLink to="/signin" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-purple-800 rounded-lg hover:bg-purple-900">
                            REGISTRARSE
                        </NavLink>
                    </div>
                </div>
            )}
        </main>
    );
}


export default ManageApplication;
