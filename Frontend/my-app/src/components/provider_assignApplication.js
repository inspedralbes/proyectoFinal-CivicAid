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
    const assignedLocation = useSelector((state) => state.data.assignedLocation);
    const [applicationInfo, setApplicationInfo] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [workersList, setWorkersList] = useState(null);
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    const [zoomedImages, setZoomedImages] = useState(Array(applicationInfo.length).fill(false));

    const toggleZoom = (index) => {
        const newZoomedImages = [...zoomedImages];
        newZoomedImages[index] = !newZoomedImages[index];
        setZoomedImages(newZoomedImages);
    };

    useEffect(() => {
        async function fetchApplications() {
            if (isAdmin) {
                setLoading(true);

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
                } finally {
                    setLoading(false);
                }
            }
        }

        async function fetchWorkers() {
            if (isAdmin) {
                setLoading(true);

                // console.log(assignedLocation);
                try {
                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listWorkers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ assignedLocation }),
                    });
                    const data = await response.json();
                    console.log("LOS WORKERS: ", data);
                    setWorkersList(data)

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                } finally {
                    setLoading(false);

                }
            }
        }
        fetchApplications();
        fetchWorkers();
    }, []);


    const toggleSelectedWorker = (workerId) => {
        const isSelected = selectedWorkers.includes(workerId);
        console.log("UNDEFINDED???", selectedWorkers);
        if (isSelected) {
            setSelectedWorkers(selectedWorkers.filter(id => id !== workerId));
        } else {
            setSelectedWorkers([...selectedWorkers, workerId]);
        }
    };

    const acceptRequest = async () => {
        if (!selectedApplication || selectedWorkers.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Debe seleccionar una solicitud y al menos un trabajador',
            });
            return;
        }

        setLoading(true);

        try {
            const applicationStatus = 'inactive';
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/assignApplication/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    applicationId: selectedApplication.id,
                    workerIds: selectedWorkers,
                    applicationStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            Swal.fire({
                icon: 'success',
                title: 'Asignación Exitosa',
                showConfirmButton: false,
                timer: 1500,
            });
            setSelectedApplication(null);
            setSelectedWorkers([]); // Limpia los trabajadores seleccionados
        } catch (error) {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error en la solicitud',
                text: error.toString(),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="h-screen overflow-auto flex justify-center items-center lg:bg-orange-300">
            {isAdmin ? (
                <div className="container overflow-auto h-full w-full lg:w-9/12 lg:rounded-lg bg-gray-800 shadow-lg dark:bg-neutral-800">
                    <nav className="text-center backdrop-filter backdrop-blur-l bg-opacity-30 border-b-4 border-orange-600 p-4">
                        <div className="flex">
                            <li className={` m-auto list-none`}>
                                <button className={` text-gray-300 text-xl hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 font-medium cursor-pointer p-4 `}>
                                    ASIGNAR SOLICITUDES
                                </button>
                            </li>
                        </div>
                    </nav>

                    {isLoading ?
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div role="status" className="flex items-center justify-center mt-20">
                                <svg aria-hidden="true" className="inline-flex w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                            </div>
                        </div>

                        :

                        <div className="p-5 lg:flex lg:flex-wrap lg:p-8 lg:justify-center lg:gap-20 lg:overflow-auto">
                            {applicationInfo.map((request, id) => {
                                if (request.applicationStatus != 'pending') {
                                    return null;
                                }
                                return (
                                    <div key={id} onClick={() => setSelectedApplication(request)} className="relative w-full lg:w-1/3 p-5 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg mb-4">
                                        <div className="uppercase items-center justify-between">
                                            <h5 className="block font-sans text-center text-xl antialiased font-medium leading-snug tracking-normal text-blue-gray-900">{request.title}</h5>
                                        </div>

                                        <div className="relative mt-5 overflow-hidden shadow-lg rounded-xl">
                                            <img src={request.image} alt={request.title} />
                                            <div className="absolute inset-0 w-full h-full to-bg-black-10 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                        </div>

                                        <div className="p-4">
                                            <div className="text-base font-light text-gray-700 overflow-y-auto max-h-36 break-words">
                                                {request.description}
                                            </div>
                                            <div className='mt-3'>
                                                <h3>Localización</h3>
                                                <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                                    {request.location}
                                                </p>
                                            </div>
                                            <div className='mt-3'>
                                                <h3>SECTOR SOLICITADO</h3>
                                                <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                                    {request.sector}, {request.subsector}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    }

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
                <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center">
                    <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedApplication(null)}>
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
                        <div className='flex justify-between items-start p-4 border-b'>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles de la solicitud</h3>
                            <div className='cursor-pointer rounded-md text-gray-400 hover:text-gray-600' onClick={() => setSelectedApplication(null)}>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white px-4 py-5 sm:p-6">
                            <h3 className="text-base leading-6 font-medium text-gray-900">SECTOR: {selectedApplication.sector}</h3>
                            <p className="mt-2 text-sm text-gray-500">Localización: {selectedApplication.location}</p>
                        </div>
                        <div className="px-4 py-2">
                            {workersList.map((worker, id) => {
                                return worker.sector === selectedApplication.sector ? (
                                    <div key={id} className="bg-gray-200 p-4 mb-4 rounded-lg flex flex-col">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-gray-600"
                                                checked={selectedWorkers.includes(worker.id)}
                                                onChange={() => toggleSelectedWorker(worker.id)}
                                            />
                                            <span className="ml-2 text-gray-700">{worker.name} {worker.surname} | {worker.dni}</span>
                                        </label>
                                        <div className="text-sm mt-2 text-gray-500">
                                            ESTADO: {worker.workerStatus} <br></br> SOLICITUDES ASIGNADAS: {worker.assignedApplications}
                                        </div>
                                    </div>
                                ) : null;
                            })}
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse justify-between">
                            <div>
                                <button onClick={() => acceptRequest(selectedApplication)} type="button" className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-300 text-base font-medium text-black hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    ACEPTAR
                                </button>
                                <button onClick={() => setSelectedApplication(selectedApplication)} type="button" className="w-full mt-2 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    DENEGAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}


export default ManageApplication;
