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

    const adminId = useSelector((state) => state.data.id);
    const isAdmin = useSelector((state) => state.isAdmin);
    const [requestInfo, setRequestInfo] = useState([]);
    const checkAppOngoing = useSelector((state) => state.applicationOngoing);
    const assignedLocation = useSelector((state) => state.data.assignedLocation);
    const [selectedRequest, setSelectedRequest] = useState(null);



    useEffect(() => {
        async function fetchSigninRequests() {
            if (isAdmin) {
                setLoading(true);

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
                    setRequestInfo(data);

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                    Swal.fire({
                        position: "bottom-end",
                        icon: "error",
                        title: "Algo ha ido mal",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchSigninRequests();
    }, []);

    function generatePassword(length = 10) {
        // Definir los caracteres que se usarán para generar la contraseña
        // const charset = {
        //     lowercase: "abcdefghijklmnopqrstuvwxyz",
        //     uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        //     numbers: "0123456789",
        //     symbols: "!@#$%^&*()_+-=[]{}|;':,.<>/?"
        // };

        // // Asegurarse de que la contraseña incluya al menos un carácter de cada tipo
        // const allTypes = Object.keys(charset).map(type => charset[type]);
        // let password = allTypes.map(type => type[Math.floor(Math.random() * type.length)]).join('');

        // // Completar la longitud de la contraseña con caracteres aleatorios de todos los tipos
        // const allChars = allTypes.join('');
        // for (let i = password.length; i < length; i++) {
        //     password += allChars[Math.floor(Math.random() * allChars.length)];
        // }

        // // Mezclar la contraseña para que los caracteres obligatorios no estén al inicio
        // password = password.split('').sort(() => Math.random() - 0.5).join('');

        // console.log("ESTA ES LA PASSWORD: ", password);
        let password = "Cm12345-";
        return password;
    }

    const acceptRequest = async (e) => {
        // e.preventDefault(e);
        const assignedApplications = 0;
        const password = generatePassword(12); // Generar contraseña de 12 caracteres
 
        const formData = new FormData();
        formData.append('approvedBy', adminId);
        formData.append('dni', e.dni);
        formData.append('name', e.name);
        formData.append('surname', e.surname);
        formData.append('secondSurname', e.secondSurname);
        formData.append('sector', e.sector);
        formData.append('assignedLocation', e.requestedLocation);
        formData.append('email', e.email);
        formData.append('profileImage', e.profileImage);
        formData.append('password', password);
        formData.append('assignedApplications', assignedApplications);
        
        console.log("SWGURO ???", selectedRequest);
        
        const requestStatus = "accepted";
        console.log("añañañaña: ", e);
        
        try {
            setLoading(true);
            setSelectedRequest(null);

            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/acceptRequest`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
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
                    Swal.fire({
                        position: "bottom-end",
                        icon: "error",
                        title: "Error al intentar actualizar el estado de la solicitud",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }

                // Volvemos a actualizar el listado de las solicitudes haciendo otra vez el fetch
                const response2 = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listRequests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ assignedLocation }),
                });
                const data2 = await response2.json();
                console.log("EL 2??:", data2);
                setRequestInfo(data2);
            } else {
                console.error('Error al enviar la solicitud:', response.statusText);
            }

            Swal.fire({
                position: "bottom-end",
                icon: "success",
                title: "La solicitud se ha aceptado correctamente",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }finally{
            setLoading(false);
        }
    }

    return (
        <main className="h-screen overflow-auto flex justify-center items-center lg:bg-orange-300">
            {isAdmin ? (
                <div className="container overflow-auto h-full w-full lg:w-9/12 lg:rounded-lg bg-gray-800 shadow-lg dark:bg-neutral-800">
                    <nav className="backdrop-filter backdrop-blur-l bg-opacity-30 border-b-4 border-orange-600 p-4">
                        <div className="text-center">
                            <li className={`list-none`}>
                                <button className={`text-gray-300 text-xl hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 font-medium cursor-pointer `}>
                                    SOLICITUDES DE REGISTRO
                                </button>
                            </li>
                        </div>
                    </nav>

                    {isLoading ?
                        <div className='flex justify-center items-center h-3/6'>
                            <svg aria-hidden="true" className="inline-flex items-center justify-center w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                        </div>

                        :

                        <div className="mt-5 text-center">
                            <div className="overflow-x-auto overflow-y-auto text-white">
                                <table className="table-auto w-full border-collapse border border-t-0 border-b-0 border-r-0 border-l-0 border-gray-200 mb-6">
                                    <thead>
                                        <tr className='uppercase'>
                                            <th className="px-4 py-2">ID</th>
                                            <th className="px-4 py-2">Nombre</th>
                                            <th className="px-4 py-2">Ubicación solicitada</th>
                                            <th className="px-4 py-2">Sector solicitado</th>
                                            <th className="px-4 py-2">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {requestInfo.map((request, id) => (
                                            <tr key={id} onClick={() => setSelectedRequest(request)} className='cursor-pointer hover:bg-gray-700'>
                                                <td className="px-4 py-8 whitespace-nowrap">{request.id}</td>
                                                <td className="px-4 py-8 whitespace-nowrap">{request.name} {request.surname}</td>
                                                <td className="px-4 py-8 whitespace-nowrap">{request.requestedLocation}</td>
                                                <td className="px-4 py-8 whitespace-nowrap">{request.sector}</td>
                                                {/* <td className="px-4 py-8 whitespace-nowrap">{request.created_at}</td> */}
                                                <td className="px-4 py-8 whitespace-nowrap uppercase">{request.requestStatus}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
            {selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto lg:mt-5">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedRequest(null)}></div>

                        {/* Modal container */}
                        <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
                            <div className='flex justify-between items-start p-4 border-b'>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles de la solicitud</h3>
                                <div className='cursor-pointer p-2 rounded-md text-gray-400 hover:text-gray-600' onClick={() => setSelectedRequest(null)}>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>

                            <div className="bg-white p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img className="h-24 w-24 bg-orange-500 p-2 rounded-full" src={selectedRequest.profileImage} alt="" />
                                    <div className="space-y-1 font-medium">
                                        <div>{selectedRequest.name} {selectedRequest.surname} {selectedRequest.secondSurname}</div>
                                        <p className="text-sm text-gray-500">{selectedRequest.email}</p>
                                    </div>
                                </div>
                                <ul className="list-none space-y-2">
                                    <li><strong>DNI:</strong> {selectedRequest.dni}</li>
                                    <li><strong>Sector:</strong> {selectedRequest.sector}</li>
                                    <li><strong>Localización solicitada:</strong> {selectedRequest.requestedLocation}</li>
                                </ul>
                            </div>

                            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button onClick={() => acceptRequest(selectedRequest)} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Aceptar
                                </button>
                                <button onClick={() => setSelectedRequest(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                                    Denegar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main>

    );
}


export default ManageSigninRequest;
