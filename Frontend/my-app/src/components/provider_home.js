import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { store, actions } from './store';
import { NavLink } from 'react-router-dom';
import Swal from "sweetalert2";

const Home = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const isUser = useSelector((state) => state.isUser);
    const isWorker = useSelector((state) => state.isWorker);
    const isAdmin = useSelector((state) => state.isAdmin);
    const applicationOngoing = useSelector((state) => state.applicationOngoing);


    const checkApplicationOngoing = localStorage.getItem('persist:root');

    useEffect(() => {
        async function comprobar() {

            // Verificar si hay datos en el Local Storage
            if (checkApplicationOngoing) {
                // Convertir el JSON almacenado a un objeto JavaScript
                const parsedData = JSON.parse(checkApplicationOngoing);

                // Obtener el valor de "applicationOngoingInfo"
                const applicationOngoingInfo = parsedData.applicationOngoingInfo;
                const applicationOngoing = parsedData.applicationOngoing;
                // Ahora puedes utilizar la variable "applicationOngoingInfo" según necesites
                console.log("Esta la aplicacion en marcha? ", applicationOngoing);
                console.log("Esta es la aplicacion en marcha: ", applicationOngoingInfo);

            } else {
                console.log('La variable del Local Storage está vacía');
            }
        }
        comprobar();
    }, [checkApplicationOngoing]); // Añadir workerSector como una dependencia del efecto


    function logout() {

        dispatch(actions.logout());
        localStorage.setItem('access_token', "0");
        Swal.fire({
            position: "bottom-end",
            icon: "info",
            title: "You have successfully loged out",
            showConfirmButton: false,
            timer: 1500,
        });
    }

    return (
        <main className='min-h-screen items-center justify-center'>
            <div className='text-center pt-5'>
                <h1 className='text-5xl font-bold mb-4'>CivicAid</h1>
            </div>




            {isUser ?
                <div>
                    <br />
                    <div className='text-center'>
                        <NavLink to="/makeApplication">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                HACER SOLICITUD
                            </button>
                        </NavLink>
                    </div>

                    <br />

                    <div className='text-center'>
                        <NavLink to="/ownApplication">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                MOSTRAR SOLICITUDES PROPIAS
                            </button>
                        </NavLink>
                    </div>
                    <br />
                </div>

                :

                <div></div>
            }

            {isWorker ?
                <div className='text-center'>
                    <br />
                    <NavLink to="/manageApplications">
                        <button
                            className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                        >
                            MOSTRAR SOLICITUDES
                        </button>
                    </NavLink>
                </div>

                :

                <div></div>
            }

            {isAdmin ?
                <div className='text-center'>
                    <div>
                        <br />
                        <NavLink to="/manageSigninRequests">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                MOSTRAR SOLICITUDES DE REGISTRO
                            </button>
                        </NavLink>
                    </div>

                    <div>
                        <br />
                        <NavLink to="/manageApplications">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                MOSTRAR SOLICITUDES
                            </button>
                        </NavLink>
                    </div>
                </div>

                :

                <div></div>
            }

            {applicationOngoing ?
                <div>
                    <br />
                    <div className='text-center'>
                        <NavLink to="/applicationOngoing">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                SOLICITUD ACEPTADA
                            </button>
                        </NavLink>
                    </div>
                </div>

                :

                <div></div>
            }

            {isLoggedIn ?
                <div>
                    <br />
                    <div className='text-center'>
                        <NavLink to="/profile">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                PERFIL
                            </button>
                        </NavLink>
                    </div>

                    <br />

                    <div className='text-center'>
                        <button
                            onClick={() => logout()} className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>

                :

                <div>
                    <div className='text-center'>
                        <NavLink to="/login">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                MODO CIUIDADANO
                            </button>
                        </NavLink>
                    </div>

                    <br />

                    <div className='text-center'>
                        <NavLink to="/loginWorker">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                MODO PROFESIONAL
                            </button>
                        </NavLink>
                    </div>

                    <br />

                    <div className='text-center'>
                        <NavLink to="/loginAdmin">
                            <button
                                className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                            >
                                MODO ADMIN
                            </button>
                        </NavLink>
                    </div>

                </div>
            }
        </main>
    );
}


export default Home;
