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

        async function fetchWorkers() {
            if (isAdmin) {
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
        <main className='min-h-screen bg-gray-100 items-center justify-center'>
            {isAdmin ? (
                <div className='p-5'>
                    {applicationInfo.map((request, id) => (
                        <div key={id} className="relative flex w-full max-w-[26rem] p-5 cursor-pointer flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg">
                            <div className="p-6">
                                <div>
                                    <img 
                                        src={request.image} 
                                        alt={request.title} 
                                        className={`rounded-lg ${zoomedImages[id] ? 'zoomed' : ''}`}
                                        onClick={() => toggleZoom(id)}
                                        />
                                        
                                </div>
                                <div onClick={() => setSelectedApplication(request)} >
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
                        <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedApplication(null)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">ID DEL SOLICITANTE: {selectedApplication.id}</h3>
                                <h3 className="mt-2 text-gray-500">
                                    SECTOR: {selectedApplication.sector}
                                </h3>
                                <h3 className="mt-2 text-gray-500">
                                    REQUESTED LOCATION: {selectedApplication.location}
                                </h3>
                            </div>
                            <div className='p-5'>
                                {workersList.map((worker, id) => {
                                    return worker.sector === selectedApplication.sector ? (
                                        <div key={id} className="relative flex w-full max-w-[26rem] mb-5 cursor-pointer flex-col rounded-xl bg-gray-400 bg-clip-border text-gray-700 shadow-lg">
                                            <div className="p-6">
                                                <label className="block font-sans text-xl antialiased leading-relaxed text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedWorkers.includes(worker.id)}
                                                        onChange={() => toggleSelectedWorker(worker.id)}
                                                    />
                                                    {worker.name} {worker.surname} {worker.secondSurname} | {worker.dni}
                                                </label>
                                            </div>
                                            <div className='p-5 '>
                                                <div>STATUS: {worker.workerStatus}</div>
                                                <div>ASSIGNED APPLICATIONS: {worker.assignedApplications}</div>
                                            </div>
                                            {console.log("SELECTED: ", selectedWorkers)}
                                        </div>
                                    ) : (
                                        // Si no quieres mostrar nada cuando no se cumpla la condición, simplemente retorna null o un fragmento vacío <> </>
                                        <div key={id}></div>
                                    );
                                })}
                            </div>

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
