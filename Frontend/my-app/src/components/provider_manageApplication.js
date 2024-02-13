import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';

import Swal from "sweetalert2";
import moment from 'moment';

const ManageApplication = () => {
    // const [messageError, setMessageError] = useState("Error");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const userInfo = useSelector((state) => state.data);
    const token = localStorage.getItem('access_token');

    const isWorker = useSelector((state) => state.isWorker);
    const workerSector = useSelector((state) => state.workerSector);
    const sector = "Servicios Médicos";
    const [applicationInfo, setApplicationInfo] = useState([]);
    const applicationOngoing = useSelector((state) => state.applicationOngoing);

    useEffect(() => {
        // const sector = userInfo.sector;

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

                    setApplicationInfo(data)
                    console.log(data);

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

        navigate("/");
        dispatch(actions.applicationOngoing())
        // console.log("SISI ESTO FUNCIONA");
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
                    {/* CARD */}
                    {applicationInfo.map((application, applicationId) => (
                        <div key={applicationId} className="relative flex w-full max-w-[26rem] p-5 mt-5 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg">
                            <div
                                className="relative mx-4 mt-4 overflow-hidden text-white shadow-lg rounded-xl bg-blue-gray-500 bg-clip-border shadow-blue-gray-500/40">
                                <img
                                    src="https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1470&amp;q=80"
                                    alt="ui/ux review check" />
                                <div
                                    className="absolute inset-0 w-full h-full to-bg-black-10 bg-gradient-to-tr from-transparent via-transparent to-black/60">
                                </div>
                                <button
                                    className="!absolute  top-4 right-4 h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-full text-center align-middle font-sans text-xs font-medium uppercase text-red-500 transition-all hover:bg-red-500/10 active:bg-red-500/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                    type="button">
                                    {/* <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                            <path
                                                d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z">
                                            </path>
                                        </svg>
                                    </span> */}
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="block font-sans text-xl antialiased font-medium leading-snug tracking-normal text-blue-gray-900">
                                        {application.title}
                                    </h5>
                                </div>
                                <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                    {application.description}
                                </p>
                            </div>
                            <div className="p-6 pt-3">
                                <button
                                    onClick={() => handleApplication(application)}
                                    className=" block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                    type="submit">
                                    ACEPTAR
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* CARD */}
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
