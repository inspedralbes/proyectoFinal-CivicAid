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

    const isAdmin = useSelector((state) => state.isAdmin);
    const assignedLocation = useSelector((state) => state.data.assignedLocation);;
    const [applicationInfo, setApplicationInfo] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // const applicationOngoingInfo = useSelector((state) => state.applicationOngoingInfo.id);
    // const checkAppOngoing = useSelector((state) => state.applicationOngoing);


    useEffect(() => {
        async function fetchApplications() {

            if (isAdmin) {
                console.log(assignedLocation);
                try {
                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listApplicationsLocation', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ assignedLocation }),
                    });
                    const data = await response.json();
                    console.log(data);
                    setApplicationInfo(data)

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                }
            }
        }
        fetchApplications();
    }, []); // Añadir workerSector como una dependencia del efecto


    const handleApplication = async (e) => {
        // e.preventDefault(e);
        setLoading(true);

        // if (checkAppOngoing) {
        //     // Mostrar el modal
        //     setShowModal(true);
        // } else {
        //     try {
        //         let applicationStatus = e.applicationStatus = "active";

        //         const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateApplicationStatus/${e.id}`, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${token}`,
        //             },
        //             body: JSON.stringify({ applicationStatus }),
        //         });

        //         const data = await response.json();

        //         console.log(data);

        //         // setApplicationInfo(data)

        //     } catch (error) {
        //         console.error("ESTE ES EL ERROR: ", error);
        //     }

        //     // navigate("/");
        //     dispatch(actions.applicationOngoing(e))
        // }

    }


    const acceptRequest = async (e) => {
        // e.preventDefault(e);
        setLoading(true);

        const id = e.id;
        const name = e.name;
        const surname = e.surname;
        const secondSurname = e.surname;
        const sector= e.sector;
        const assignedLocation = e.requestedLocation;
        const email = e.email;
        // const password = generatePassword(12); // Generar contraseña de 12 caracteres
        const requestStatus = "accepted";
        
        console.log(selectedApplication);


        try {
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/acceptRequest/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, surname, secondSurname, sector, assignedLocation, email}),
            });

            setSelectedApplication(false);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        
            // const responseData = await response.text();
            // console.log(responseData); // Imprime la respuesta del servidor
            // const data = JSON.parse(responseData);
            // console.log("ESTA ES LA ULTIMA DATA: ", data);

            if (response.ok) {
                console.log('Solicitud enviada exitosamente');
                try {
                    const response2 = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateRequestStatus/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ requestStatus }),

                    });
                    const data2 = await response2.json();
                    console.log("ESTA ES LA DATA 2: ", data2);
                } catch (error) {
                    
                }
            } else {
                console.error('Error al enviar la solicitud:', response.statusText);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    return (
        <main className='min-h-screen bg-gray-100 items-center justify-center'>
            {isAdmin ? (
                <div className='p-5'>
                    {applicationInfo.map((request, id) => (
                        <div key={id} onClick={() => setSelectedApplication(request)} className="relative flex w-full max-w-[26rem] p-5 cursor-pointer flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg">
                            <div className="p-6">
                                <h1 className="block font-sans text-xl antialiased leading-relaxed text-gray-700">
                                    {request.title}
                                </h1>
                                <br />
                                <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                    {request.description}
                                </p>
                                <br />
                                <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                    SERVICIOS SOLICITADOS: {request.sector}
                                </p>
                            </div>
                        </div>
                    ))}
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

            {/* Modal */}
            {selectedApplication && (
                <div className="fixed mt-5 inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Fondo semi-transparente */}
                        <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedApplication(null)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        {/* Aquí iría tu modal / detalle de la solicitud */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full">
                            {/* Detalles de la solicitud */}
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedApplication.name} {selectedApplication.surname} {selectedApplication.secondSurname}</h3>
                                <h3 className="mt-2 text-gray-500">
                                    SECTOR: {selectedApplication.sector}
                                </h3>
                                <h3 className="mt-2 text-gray-500">
                                    EMAIL: {selectedApplication.email}
                                </h3>
                                <h3 className="mt-2 text-gray-500">
                                    REQUESTED LOCATION: {selectedApplication.requestedLocation}
                                </h3>
                                {/* Aquí más detalles si los necesitas */}
                            </div>
                            {/* Botones o acciones */}
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse justify-between">
                                <button onClick={() => setSelectedApplication(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    CERRAR
                                </button>

                                <div>
                                    <button onClick={() => acceptRequest(selectedApplication)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        ACEPTAR
                                    </button>
                                    <button onClick={() => setSelectedApplication(selectedApplication)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        DENEGAR
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}


export default ManageApplication;
