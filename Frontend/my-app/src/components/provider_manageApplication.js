import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';

import Swal from "sweetalert2"

const ManageApplication = ({ socket }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalInfo, setModalInfo] = useState(false);
    const [showLobbyModal, setShowLobbyModal] = useState(false);
    const [modalLobbyInfo, setModalLobbyInfo] = useState([]);

    const token = localStorage.getItem('access_token');

    const userName = useSelector((state) => state.data.name);
    const userSurname = useSelector((state) => state.data.surname);
    const userSecondSurname = useSelector((state) => state.data.secondSurname);
    const completeName = `${userName} ${userSurname} ${userSecondSurname}`
    const workerId = useSelector((state) => state.data?.id);
    const isWorker = useSelector((state) => state.isWorker);
    const sector = useSelector((state) => state.data.sector);
    const [applicationInfo, setApplicationInfo] = useState([]);
    const [countMaxUsers, setCountMaxUsers] = useState([]);
    const applicationOngoingInfo = useSelector((state) => state.applicationOngoingInfo.id);
    const checkAppOngoing = useSelector((state) => state.applicationOngoing);
    const [activeTab, setActiveTab] = useState("tab1");
    const [receivedInvitations, setReceivedInvitations] = useState(new Map());
    const [applicationsNode, setApplicationsNode] = useState(null);
    const [actualLobbyCode, setActualLobbyCode] = useState(null);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [invitationCreated, setInvitationCreated] = useState(false);
    const [invitationAccepted, setInvitationAccepted] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [canStartApplication, setCanStartApplication] = useState(true);
    const [actualApplication, setActualApplication] = useState(true);

    const [invitationModal, setInvitationModal] = useState(false);

    const applicationNodeOngoing = useSelector((state) => state.applicationNodeOngoing);
    const applicationOngoing = useSelector((state) => state.applicationOngoing);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    /**
     * USE EFFECT DE LAS FUNCIONES NORMALES
     */
    useEffect(() => {
        /**
        * Funcion para pedir la solicitudes sin compartir
        */
        async function fetchApplications() {
            if (isWorker) {
                setLoading(true);
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
                    setApplicationInfo(data)

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                } finally {
                    setLoading(false);

                }
            }
        }

        fetchApplications();
    }, [applicationOngoingInfo]);


    /**
     * USE EFFECT DE LOS SOCKETS
     */
    useEffect(() => {
        console.log("Conectado al servidor");

        /**
         * SOCKET PARA ENVIAR EL ID DEL EMPLEADO Y QUE SE ASOCIE CON EL ID DE SU SOCKET
         */
        socket.emit("register", workerId);

        /**
         * SOCKET PARA PEDIR LAS SOLICITUDES COMPARTIDAS
         */
        const fetchMultipleAssignedData = {
            token: token,
            isWorker: isWorker,
            workerId: workerId
        }
        socket.emit("fetchMultipleAssigned", fetchMultipleAssignedData);

        socket.on("returnFetchMultipleAssigned", (data) => {
            setApplicationsNode(data.applications);
        });


    }, [receivedInvitations]);

    /**
    * SOCKET PARA CONTROLAR CUANDO TE INVITAN
    */
    socket.on("invitationReceived", (data) => {
        try {
            setReceivedInvitations(prev => new Map(prev).set(data.applicationId, { lobbyCode: data.lobbyCode, invited: true }));

            return () => {
                socket.off("invitationReceived");
            };

        } catch (error) {
            console.log("ERROR DEL ID: ", error);
        }
    });

    /**
     * SOCKET PARA RECIBIR LA CANCELACION DE LA INVITACION CUANDO EL ANFITRION CANCELA LA SOLICITUD
     */
    socket.on("invitationCanceled", (data) => {
        if (receivedInvitations.has(data.applicationId)) {
            const newInvitations = new Map(receivedInvitations);
            newInvitations.delete(data.applicationId);
            setReceivedInvitations(newInvitations);

            setInvitationAccepted(false); // Ponemos en falso para que no se muestre el modal del lobby

            console.log("Invitación eliminada del mapa");
        } else {
            console.log("No se encontró ninguna invitación con la clave dada para eliminar");
        }

        return () => {
            socket.off("invitationReceived");
        };

    })

    /**
     * SOCKET PARA MANEJAR CADA VEZ QUE UN USUARIO SE UNE A UNA LOBBY
     */
    socket.on("newUserInLobby", (data) => {
        setUsersList(data.users);
        setCanStartApplication(data.startApplication)
    })

    /**
     * SOCKET PARA QUE, CUANDO EL ANFITRION DE LA SALA LE DA A ACEPTAR, SE ACTIVE LA SOLICITUD PARA TODOS LOS EMPLEADOS DE LA SALA
     */
    socket.on("returnAppOngoing", (data) => {

        dispatch(actions.applicationNodeOngoing(data.actualApplication))

        // Mostramos un mensaje de éxito
        Swal.fire({
            position: "center",
            icon: "success",
            title: "La solicitud se ha aceptado correctamente",
            showConfirmButton: false,
            timer: 3500,
        });

        //Redirigimos al empleado
        navigate("/applicationOngoing")

        return () => {
            socket.off("returnAppOngoing");
        };

    })

    /**
     * SOCKET PARA MANEJAR LOS ERRORES DE CONEXIÓN
     */
    socket.on("connect_error", (error) => {
        // Muestra información más detallada sobre el error
        console.log("Error de conexión:", error.message);
        if (error.description) {
            console.log("Descripción del error:", error.description);
        }

        // Reintenta la conexión después de un retraso
        const RETRY_DELAY = 5000; // 5 segundos
        console.log(`Intentando reconectar en ${RETRY_DELAY / 1000} segundos...`);
        setTimeout(() => {
            console.log("Reintentando conexión...");
            socket.connect();
        }, RETRY_DELAY);

        // Proporciona sugerencias basadas en tipos de error comunes
        if (error.message.includes("ECONNREFUSED")) {
            console.log("El servidor rechazó la conexión. ¿Está seguro de que está corriendo y accesible?");
        } else if (error.message.includes("timeout")) {
            console.log("Tiempo de espera agotado. Verifique su conexión de red y la URL del servidor.");
        }
    });

    const maxUsers = (e) => {
        setCountMaxUsers(e.workers.length);
    }

    const codeGenerator = () => {
        const randomCode = Math.floor(
            Math.random() * (100000 - 999999 + 1) + 999999
        );

        return randomCode;
    };

    const cancelInvitation = () => {
        socket.emit("cancelInvitation", {
            applicationId: actualApplication.id,
            usersList: actualApplication.workers,
            hostId: workerId
        })

        setInvitationCreated(false);

    }
    const acceptInvitation = (applicationId, lobbyCode) => {
        if (applicationOngoing) {
            setShowModal(true);
        } else {
            const getInvitation = receivedInvitations.get(applicationId);
            if (getInvitation.invited) {
                setActualLobbyCode(lobbyCode);
                socket.emit("acceptInvitation", {
                    applicationId: applicationId,
                    lobbyCode: lobbyCode,
                    workerId: workerId,
                    workerName: completeName

                })
                setInvitationAccepted(true);
                setShowLobbyModal(true);

            }
        }
    };

    const createInvitation = async (e) => {
        try {
            if (!applicationNodeOngoing) {

                const room = codeGenerator();
                maxUsers(e);

                const invitationData = {
                    applicationId: e.id,
                    assignedWorkers: e.workers,
                    hostId: workerId,
                    lobbyCode: room,
                    maxUsers: e.workers.length,
                    completeName: completeName,
                };

                socket.emit("sendInvitation", invitationData);

                setShowLobbyModal(true);
                setInvitationCreated(true);
                setActualApplication(e);
                setActualLobbyCode(room);

            } else {
                setInvitationModal(true)
            }
        } catch (error) {
            console.error("Error al enviar la invitación:", error);
        }
    }

    const handleApplication = async (e) => {

        if (checkAppOngoing) {
            // Mostrar el modal
            setShowModal(true);
            setModalInfo(e)

        } else {
            try {
                setLoading(true);

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

            } catch (error) {
                console.error("ESTE ES EL ERROR: ", error);
            } finally {
                setLoading(false)
            }

            navigate("/applicationOngoing");
            dispatch(actions.applicationOngoing(e))
        }

    }

    const handleNodeApplication = async () => {

        socket.emit("startApplication", {
            usersList: usersList,
            actualApplication: actualApplication,
            token: token,
        })
    }


    const updateAppOngoing = async (e) => {
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

            navigate("/");
            dispatch(actions.applicationOngoing(e))

        } catch (error) {
            console.error("ERROR EN EL SEGUNDO FETCH: ", error);

        } finally {
            setLoading(false)

        }
    }


    return (
        <main className="h-screen overflow-auto flex justify-center items-center lg:bg-orange-300">
            {isWorker ? (
                <div className="container overflow-auto h-full w-full lg:w-9/12 lg:rounded-lg bg-gray-800 shadow-lg dark:bg-neutral-800">
                    <nav className="text-center backdrop-filter backdrop-blur-l bg-opacity-30 border-b-4 border-orange-600 p-4">
                        <div className="flex">
                            <li className={`w-6/12 list-none`}>
                                <button onClick={() => handleTabClick("tab1")} className={` text-gray-300 text-xl hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 font-medium cursor-pointer p-4 ${activeTab === "tab1" ? "active bg-gray-700" : ""}`}>
                                    SOLICITUDES PRIVADAS
                                </button>
                            </li>

                            <li className={`w-6/12 my-auto list-none`}>
                                <button onClick={() => handleTabClick("tab2")} className={`text-gray-300 text-xl hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 font-medium cursor-pointer ${activeTab === "tab2" ? "active bg-gray-700" : ""}`}>
                                    SOLICITUDES COMPARTIDAS
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

                        <div>
                            {activeTab === "tab1" &&
                                <div className="p-5 lg:flex lg:flex-wrap lg:p-8 lg:justify-center lg:gap-20 lg:overflow-auto">

                                    {applicationInfo.length === 0 ? (
                                        <div className='flex items-center justify-center'>
                                            <h1 className='text-white text-center text-3xl font-bold'>
                                                No hay solicitudes privadas asignadas en este momento
                                            </h1>
                                        </div>
                                    ) : (
                                        applicationInfo.map((application, id) => {
                                            // No renderizar el div si la condición se cumple
                                            if (applicationOngoingInfo === application.id || application.applicationStatus === 'completed') {
                                                return null;
                                            }

                                            return (
                                                <div key={id} className="relative w-full lg:w-1/3 p-5 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg mb-4">
                                                    {/* Contenido de la solicitud */}
                                                    <div className="uppercase items-center justify-between">
                                                        <h5 className="block font-sans text-center text-xl antialiased font-medium leading-snug tracking-normal text-blue-gray-900">{application.title}</h5>
                                                    </div>
                                                    <div className="relative mt-5 overflow-hidden shadow-lg rounded-xl">
                                                        <img src={application.image} alt="Imagen solicitud" className="w-full object-cover h-48 rounded-t-xl" />
                                                        <div className="absolute inset-0 w-full h-full to-bg-black-10 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                                    </div>

                                                    <div className="p-4">
                                                        <div>
                                                            <div className="text-base font-light text-gray-700 overflow-y-auto max-h-36 break-words">
                                                                {application.description}
                                                            </div>

                                                        </div>

                                                        <div className='mt-3'>
                                                            <h3>Localización</h3>
                                                            <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                                                {application.location}
                                                            </p>

                                                        </div>
                                                    </div>
                                                    <div className="p-6 pt-3">
                                                        <button
                                                            onClick={() => handleApplication(application)}
                                                            className="block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                            type="submit">
                                                            ACEPTAR
                                                        </button>
                                                    </div>

                                                </div>
                                            );
                                        }))}
                                </div>
                            }


                            {activeTab === "tab2" && (
                                <div className="p-5 lg:flex lg:flex-wrap lg:p-8 lg:justify-center lg:gap-20 lg:overflow-auto">

                                    {applicationsNode.length === 0 ? (
                                        <div className='flex items-center justify-center'>
                                            <h1 className='text-white text-center text-3xl font-bold'>
                                                No hay solicitudes compartidas asignadas en este momento
                                            </h1>
                                        </div>
                                    ) : (
                                        
                                            applicationsNode.map((application, id) => {
                                                const isCurrentAppInvited = receivedInvitations.get(application.id)?.invited ?? false;
                                                const currentAppInvitedLobbyCode = receivedInvitations.get(application.id)?.lobbyCode;
                                                if (applicationOngoingInfo === application.id || application.applicationStatus === 'completed' || application.applicationStatus === 'active') {
                                                    return null;
                                                }
                                                
                                                return (
                                                    <div key={id} className="relative w-full lg:w-3/4 xl:w-2/3 mx-auto flex flex-col rounded-xl bg-white shadow-lg mb-8 overflow-hidden">
                                                        <div className="lg:flex lg:flex-row">

                                                            <div className="lg:w-1/2 p-5 flex flex-col justify-between">
                                                                <div>
                                                                    <div className="uppercase items-center justify-between mb-5">
                                                                        <h5 className="text-2xl text-center font-semibold text-blue-gray-900">{application.title}</h5>
                                                                    </div>
                                                                    <div className="relative overflow-hidden shadow-lg rounded-xl">
                                                                        <img
                                                                            src={application.image}
                                                                            alt={application.image ? "Imagen solicitud" : "Imagen no disponible"}
                                                                            className="w-full lg:h-64 object-cover rounded-xl"
                                                                        />
                                                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-5">
                                                                    <div className="text-base font-light text-gray-700 overflow-y-auto max-h-36 break-words mb-3">
                                                                        {application.description}
                                                                    </div>
                                                                    <div className="mt-5">
                                                                        <h3 className="font-semibold text-gray-800">Localización</h3>
                                                                        <p className="text-base font-light leading-relaxed text-gray-700">
                                                                            {application.location}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="lg:w-1/2 p-5 bg-gray-300 flex flex-col justify-between rounded-r-xl">
                                                                <div>
                                                                    <h2 className="mb-5 text-xl font-semibold text-gray-800">Compañeros Asignados</h2>
                                                                    <div className="overflow-y-auto max-h-48 grid grid-cols-2 gap-4">
                                                                        {application.workers.map((worker, id) => {
                                                                            if (worker.id === workerId) {
                                                                                return null;
                                                                            }
                                                                            return (
                                                                                <div key={id} className="bg-white text-center shadow-lg p-2 rounded-lg">
                                                                                    <p className="text-base font-light text-gray-700">
                                                                                        {worker.name} {worker.surname}
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-5">
                                                                    {isCurrentAppInvited ? (
                                                                        <button
                                                                            onClick={() => acceptInvitation(application.id, currentAppInvitedLobbyCode)}
                                                                            className="w-full animate-pulse rounded-lg bg-gray-900 py-3.5 text-sm font-bold uppercase text-white shadow-md transition-all hover:shadow-lg"
                                                                        >
                                                                            Aceptar Invitación
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => createInvitation(application)}
                                                                            id={`invitationButton${application.id}`}
                                                                            className="w-full rounded-lg bg-gray-900 py-3.5 text-sm font-bold uppercase text-white shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                                                                            type="submit"
                                                                        >
                                                                            Invitar
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>


                                                );
                                            })
                                        )}
                                </div>

                            )}

                            {showModal && (
                                <div className="fixed z-50 inset-0 overflow-auto">
                                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 ">
                                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                        </div>

                                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                            <div className=" px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                                <div className="sm:flex sm:items-start">

                                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                        <h3 className="text-lg leading-6 font-medium text-white">SOLICITUD EN CURSO</h3>
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-300">
                                                                Ya tienes una solicitud en curso. ¿Quieres sustuirla?
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                                <button onClick={() => updateAppOngoing(modalInfo)} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                                    Sustituir
                                                </button>
                                                <button onClick={() => setShowModal(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {invitationModal && (
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
                                                                No puedes iniciar una invitacion mientras tienes una solicitud compartida en marcha
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                                <button onClick={() => setInvitationModal(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                    Cerrar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(invitationCreated || invitationAccepted) && (
                                <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-900 bg-opacity-75 overflow-y-auto">
                                    <div className="relative w-11/12 lg:w-9/12 lg:h-3/6 xl:w-7/12 h-5/6 sm:max-w-lg lg:max-w-3xl xl:max-w-4xl p-6 bg-white rounded-lg shadow-xl flex flex-col justify-between">
                                        <div className='border-b-2 pb-2'>
                                            <h2 className="text-2xl font-bold text-center text-gray-900 ">SALA DE ESPERA</h2>
                                        </div>

                                        <div className="p-4 min-h-fit max-h-80 lg:min-h-44 border-gray-200 overflow-y-auto">
                                            {Array.isArray(usersList) && usersList.length > 0 ? (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {usersList.map((user, id) => {
                                                        if (!user || user.workerId === workerId) {
                                                            return null;
                                                        }
                                                        return (
                                                            <div key={id} className="bg-gray-300 text-center shadow-lg p-3 rounded-lg transition-all fade-in-element">
                                                                <p className="text-lg font-medium text-gray-700">{user.completeName}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex justify-center items-center text-gray-600 h-full">
                                                    <p>ESPERANDO A LOS USUARIOS ...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-4 py-3 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 border-t-2">
                                            {canStartApplication ? (
                                                <div className="w-full sm:flex sm:justify-end space-x-4">
                                                    <button
                                                        onClick={() => cancelInvitation()}
                                                        type="button"
                                                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => handleNodeApplication()}
                                                        className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-gray-900 py-3.5 px-7 text-sm font-bold uppercase text-white shadow-md transition-all hover:bg-gray-700 focus:opacity-85 focus:shadow-none active:opacity-85 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                        type="submit"
                                                    >
                                                        Iniciar solicitud
                                                    </button>
                                                </div>
                                            ) : (
                                                <h1 className="m-auto text-center text-lg font-semibold">ESPERANDO AL ANFITRION ...</h1>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}



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
        </main>
    );

}


export default ManageApplication;
