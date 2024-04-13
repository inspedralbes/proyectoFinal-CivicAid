import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';

import Swal from "sweetalert2";

const ManageApplication = ({ socket }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
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
    const [actualLobbyCode, setActualLobbyCode] = useState(false);
    const [invitationCreated, setInvitationCreated] = useState(false);
    const [invitationAccepted, setInvitationAccepted] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [canStartApplication, setCanStartApplication] = useState(true);
    const [actualApplication, setActualApplication] = useState(true);

    // console.log("SOCKET: ", socket.id);

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
                }
            }
        }

        fetchApplications();
    }, [applicationOngoingInfo]);

    /**
     * USE EFFECT DE LOS SOCKETS
     */
    useEffect(() => {
        console.log("HASTA AQUI LLEGA NOOOOO?");

        socket.on("connect", () => {
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
        });


        const handleReturnFetchMultipleAssigned = (data) => {
            console.log("Solicitudes de NODE: ", data);
            setApplicationsNode(data.applications);
        };
        // Configurar el listener
        socket.on("returnFetchMultipleAssigned", handleReturnFetchMultipleAssigned);


        // Limpiar el listener anterior al desmontar el componente o al actualizar el efecto
        return () => {
            socket.off("returnFetchMultipleAssigned", handleReturnFetchMultipleAssigned);
        };
    }, []);


    socket.on("lobbiesUnido", (data) => {
        console.log("LAS LOBIS MAJAS: ", data);
    })
    /**
    * SOCKET PARA CONTROLAR CUANDO TE INVITAN
    */
    socket.on("invitationReceived", (data) => {
        // Aquí puedes actualizar el estado para mostrar la invitación en la UI
        console.log("DATA??: ", data.message);
        console.log("ESTADO??: ", data.invitation);
        console.log("ID SOLICITUD??: ", data.applicationId);
        console.log("CODIGO DEL LOBBY??: ", data.lobbyCode);

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
     * SOCKET PARA MANEJAR CADA VEZ QUE UN USUARIO SE UNE A UNA LOBBY
     */
    socket.on("newUserInLobby", (data) => {
        console.log("USERS LIST: ", data);
        setUsersList(data.users);
        setCanStartApplication(data.startApplication)
    })

    socket.on("returnAppOngoing", (data) =>{
        console.log("EL RETURN: ", data);

        dispatch(actions.applicationNodeOngoing(data.actualApplication))

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
        console.log("Número máximo de usuarios: ", e.workers.length);

    }

    const codeGenerator = () => {
        const randomCode = Math.floor(
            Math.random() * (100000 - 999999 + 1) + 999999
        );

        return randomCode;
        // setRoom(randomCode);
    };

    const acceptInvitation = (applicationId, lobbyCode) => {
        // const invitationForApplication10 = receivedInvitations.get(10);
        // receivedInvitations.forEach(invitation => {
        const getInvitation = receivedInvitations.get(applicationId);
        console.log(`INVITACION PARA SOLICITUD ${applicationId} `, getInvitation);
        if (getInvitation.invited) {
            setActualLobbyCode(lobbyCode);
            socket.emit("acceptInvitation", {
                applicationId: applicationId,
                lobbyCode: lobbyCode,
                workerId: workerId,
                workerName: completeName

            })
            setInvitationAccepted(true);

        }
        // })
    };

    const createInvitation = async (e) => {
        try {
            const room = codeGenerator();
            maxUsers(e);

            // Podrías necesitar adaptar este objeto a los detalles exactos que tu backend espera
            const invitationData = {
                applicationId: e.id,
                assignedWorkers: e.workers,
                hostId: workerId, // Asegúrate de tener este dato disponible
                lobbyCode: room, // Suponiendo que cada solicitud tiene un código de lobby asociado
                maxUsers: e.workers.length,
                completeName: completeName,
            };

            socket.emit("sendInvitation", invitationData);

            setInvitationCreated(true);
            setActualApplication(e);

            console.log("Invitación enviada a los sockets:", invitationData);
            // Aquí puedes mostrar una confirmación al usuario de que la invitación ha sido enviada
        } catch (error) {
            console.error("Error al enviar la invitación:", error);
        }
    }

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

    const handleNodeApplication = async () => {
        console.log("ESTA ES LA PEDAZO DE LISTA: ", usersList)

        socket.emit("startApplication", {
            usersList: usersList,
            actualApplication: actualApplication,
            token: token,
        })
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
            // console.log("PRIMER STATUS: ", data);

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
            // console.log("SEGUNDO STATUS: ", data2);

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
                    {/* Botones para alternar vistas */}
                    <div className="flex justify-center space-x-4 mb-4">
                        <button
                            className={`px-4 py-2 ${activeTab === 'tab1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabClick('tab1')}
                        >
                            Mis Solicitudes
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'tab2' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabClick('tab2')}
                        >
                            Solicitudes Compartidas
                        </button>
                    </div>

                    {activeTab === "tab1" &&
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
                    }

                    {activeTab === "tab2" && (
                        <div>
                            {applicationsNode.map((application, id) => {
                                const isCurrentAppInvited = receivedInvitations.get(application.id)?.invited;
                                const currentAppInvitedLobbyCode = receivedInvitations.get(application.id)?.lobbyCode;
                                // No renderizar el div si la condición se cumple
                                if (applicationOngoingInfo === application.id || application.applicationStatus === 'completed' || application.applicationStatus === 'active') {
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

                                            <div>
                                                <h2>OTHER WORKERS</h2>
                                                {application.workers.map((worker, id) => {
                                                    if (worker.id === workerId) {
                                                        return null;
                                                    }
                                                    return (
                                                        <div key={id} className="relative flex w-full max-w-[26rem] p-5 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg">
                                                            <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                                                {worker.name}
                                                            </p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className="p-6 pt-3">
                                            <button
                                                onClick={() => handleApplication(application)}
                                                className="block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                type="submit">
                                                ACEPTAR
                                            </button>


                                            {isCurrentAppInvited ? (
                                                <div>
                                                    <p>Has sido invitado a la aplicación {application.id}</p>
                                                    <button
                                                        onClick={() => acceptInvitation(application.id, currentAppInvitedLobbyCode)}
                                                        className="block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                    >
                                                        Aceptar Invitación
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <button
                                                        onClick={() => createInvitation(application)}
                                                        id={`invitationButton${application.id}`}
                                                        className="block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                        type="submit">
                                                        INVITAR
                                                    </button>
                                                </div>
                                            )

                                            }
                                        </div>
                                        {showModal && (
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
                                        )}

                                        {(invitationCreated || invitationAccepted) && (
                                            <div className="fixed inset-0 overflow-y-auto">
                                                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                                    </div>

                                                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                                            <div className="sm:flex sm:items-start">
                                                                {/* <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                    </svg>
                                                                </div> */}
                                                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                                    <div className="mt-2">
                                                                        {Array.isArray(usersList) && usersList.length > 0 ? (
                                                                            <div>
                                                                                {usersList.map((user, id) => {
                                                                                    if (!user || user.workerId === workerId) {
                                                                                        return null;
                                                                                    }
                                                                                    return (
                                                                                        <div key={id} className="text-sm text-gray-500">
                                                                                            <p>{user.completeName}</p>

                                                                                        </div>

                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        ) : (
                                                                            <div>NO HAY NADIE TODAVÍA</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                                            {/* <button onClick={() => updateAppOngoing(application)} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                                                Proceder
                                                            </button> */}
                                                            <button onClick={() => setInvitationCreated(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                                Cancelar
                                                            </button>
                                                            {canStartApplication ? 
                                                                <div className="p-6 pt-3">
                                                                    <button
                                                                        onClick={() => handleNodeApplication()}
                                                                        className="block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                                        type="submit">
                                                                        ACEPTAR
                                                                    </button>
                                                                </div>
                                                                :
                                                                <div></div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
