import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { store, actions } from './store';
import { NavLink } from 'react-router-dom';
import Swal from "sweetalert2";

const Home = () => {
    const dispatch = useDispatch();
    const isWorker = useSelector((state) => state.isWorker);
    const applicationOngoing = useSelector((state) => state.applicationOngoing);
    const userInfo = useSelector((state) => state.data?.sector);

    // console.log("EL SECTOR ES ESTE: ", userInfo);
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

            <div className='bg-white p-8 rounded shadow-md max-w-3xl w-full'>

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
                    <NavLink to="/manageApplications">
                        <button
                            className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                        >
                            MOSTRAR SOLICITUDES
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

            <div>
                <div className='text-center'>
                    <NavLink to="/profile">
                        <button
                            className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                        >
                            PERFIL
                        </button>
                    </NavLink>
                </div>
            </div>

            {applicationOngoing ?
                <div>
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
        </main>
    );
}


export default Home;
