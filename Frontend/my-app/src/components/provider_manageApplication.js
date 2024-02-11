import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';

import Swal from "sweetalert2";

const ManageApplication = () => {
    // const [messageError, setMessageError] = useState("Error");
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const userInfo = useSelector((state) => state.data);
    const isWorker = useSelector((state) => state.isWorker);
    const workerSector = useSelector((state) => state.workerSector);
    const token = localStorage.getItem('access_token');
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        const sector = userInfo.sector;

        async function fetchApplications() {
            if (isWorker) {
                try {
                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listApplicationsSector', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ sector }), // Enviar el sector del trabajador al backend
                    });
                    const data = await response.json();
                    dispatch(actions.saveData(data));

                    console.log(sector);

                } catch (error) {
                    console.error(error);
                }
            }
        }
        fetchApplications();
    }, [isWorker, workerSector]); // Añadir workerSector como una dependencia del efecto


    const handleApplication = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("SISI ESTO FUNCIONA");
        // try {
        //     const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/makeApplication', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ title, description, sector, subsector, date }),
        //     });
        //     if (!response.ok) {
        //         throw new Error(response.statusText);
        //     } else {
        //         console.log('La solicitud se ha hecho correctamente');
        //         navigate("/")
        //         Swal.fire({
        //             position: "center",
        //             icon: "error",
        //             title: "The application did not completed correctly. Please try again",
        //             html: "Remember to fill correctly all the fields",
        //             showConfirmButton: false,
        //             timer: 3500,
        //         });

        //     }
        //     const data = await response.json();
        //     Swal.fire({
        //         position: "center",
        //         icon: "success",
        //         title: "The application completed correctly",
        //         showConfirmButton: false,
        //         timer: 3500,
        //     });
        // } catch (error) {
        //     setError(error);
        // }

    }

    return (
        <main className='min-h-screen bg-gray-100 items-center justify-center'>
            {isWorker ?
                <div>
                    SISISISI

                </div>
                :
                <div>
                    <div className="p-10 text-center bg-gray-800 text-white font-bold rounded-lg">
                        <p className="mb-6 text-lg lg:text-2xl sm:px-16 xl:px-48 dark:text-gray-400">
                            NO HAS INICIADO SESIÓN
                        </p>
                        <p className="mb-6 text-lg lg:text-2xl sm:px-16 xl:px-48 dark:text-gray-400">
                            Debes iniciar sesión para poder acceder a esta parte de la página
                        </p>
                        <div className='flex justify-center uppercase'>
                            <div className='mr-2'>
                                <NavLink to="/login" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-purple-800 rounded-lg hover:bg-purple-900 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                                    INICIAR SESIÓN
                                </NavLink>
                            </div>
                            <div className='ml-2'>
                                <NavLink to="/signin" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-purple-800 rounded-lg hover:bg-purple-900 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                                    REGISTRARSE
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </main>
    );
}


export default ManageApplication;
