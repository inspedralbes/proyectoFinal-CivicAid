import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';

import Swal from "sweetalert2";

const ManageSigninRequest = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const token = localStorage.getItem('access_token');

    const isAdmin = useSelector((state) => state.isAdmin);
    const [requestInfo, setRequestInfo] = useState([]);
    const checkAppOngoing = useSelector((state) => state.applicationOngoing);
    const assignedLocation = useSelector((state) => state.data.assignedLocation);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        async function fetchSigninRequests() {
            if (isAdmin) {
                try {
                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listRequests', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ assignedLocation }),
                    });
                    const data = await response.json();
                    console.log(data);
                    setRequestInfo(data)

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                }
            }
        }
        fetchSigninRequests();
    }, []);

    function generatePassword(length = 10) {
        // Definir los caracteres que se usarán para generar la contraseña
        const charset = {
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+-=[]{}|;':,.<>/?"
        };

        // Asegurarse de que la contraseña incluya al menos un carácter de cada tipo
        const allTypes = Object.keys(charset).map(type => charset[type]);
        let password = allTypes.map(type => type[Math.floor(Math.random() * type.length)]).join('');

        // Completar la longitud de la contraseña con caracteres aleatorios de todos los tipos
        const allChars = allTypes.join('');
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Mezclar la contraseña para que los caracteres obligatorios no estén al inicio
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        console.log("ESTA ES LA PASSWORD: ", password);
        return password;
    }

    const acceptRequest = async (e) => {
        // e.preventDefault(e);
        setLoading(true);

        const id = e.id;
        const dni = e.dni;
        const name = e.name;
        const surname = e.surname;
        const secondSurname = e.secondSurname;
        const sector= e.sector;
        const assignedLocation = e.requestedLocation;
        const email = e.email;
        const password = generatePassword(12); // Generar contraseña de 12 caracteres
        const requestStatus = "accepted";
        const assignedApplications = 0;
        console.log("añañañaña: ", e.dni);


        try {
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/acceptRequest/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ dni: e.dni, name, surname, secondSurname, sector, assignedLocation, assignedApplications, email, password }),
            });

            setSelectedRequest(false);

            if (!response.ok) {
                const sisi = await response.json();
                console.log("ESTA ES EL SISI: ", sisi);

                // throw new Error('Network response was not ok');
            }

            if (response.ok) {
                console.log('Solicitud enviada exitosamente');
                try {
                    const response2 = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateRequestStatus/${e.id}`, {
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
                    {requestInfo.map((request, id) => (
                        <div key={id} onClick={() => setSelectedRequest(request)} className="relative flex w-full max-w-[26rem] p-5 cursor-pointer flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg">
                            <div className="p-6">
                                <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                    SOLICITANTE: {request.name} {request.surname} {request.secondSurname}
                                </p>

                                <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                    SECTOR: {request.sector}
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
            {selectedRequest && (
                <div className="fixed mt-5 inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedRequest(null)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedRequest.name} {selectedRequest.surname} {selectedRequest.secondSurname} | {selectedRequest.dni}</h3>
                                <h3 className="mt-2 text-gray-500">
                                    SECTOR: {selectedRequest.sector}
                                </h3>
                                <h3 className="mt-2 text-gray-500">
                                    EMAIL: {selectedRequest.email}
                                </h3>
                                <h3 className="mt-2 text-gray-500">
                                    REQUESTED LOCATION: {selectedRequest.requestedLocation}
                                </h3>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse justify-between">
                                <button onClick={() => setSelectedRequest(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    CERRAR
                                </button>
                                <div>
                                    <button onClick={() => acceptRequest(selectedRequest)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        ACEPTAR
                                    </button>
                                    <button onClick={() => setSelectedRequest(selectedRequest)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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


export default ManageSigninRequest;
