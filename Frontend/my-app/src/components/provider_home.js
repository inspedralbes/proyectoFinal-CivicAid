import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { store, actions } from './store';
import { NavLink } from 'react-router-dom';
import Swal from "sweetalert2";
import {
    Carousel,
    initTE,
} from "tw-elements";

initTE({ Carousel });


const Home = () => {
    const dispatch = useDispatch();

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
        <main className='text-center pt-5'>

            <h1 className='text-5xl font-bold mb-4 bg-slate-600'>CivicAid</h1>

            <initTE></initTE>
            <div className='bg-white p-8 rounded shadow-md max-w-3xl mx-auto'>

                <div className='mb-4'>
                    <NavLink to="/makeApplication">
                        <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 w-full'>
                            HACER SOLICITUD
                        </button>
                    </NavLink>
                </div>

                <div className='mb-4'>
                    <NavLink to="/login">
                        <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 w-full'>
                            MODO CIUDADANO
                        </button>
                    </NavLink>
                </div>

                <div className='mb-4'>
                    <NavLink to="/loginWorker">
                        <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 w-full'>
                            MODO PROFESIONAL
                        </button>
                    </NavLink>
                </div>

                <div className='mb-4'>
                    <button onClick={() => logout()} className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 w-full'>
                        LOGOUT
                    </button>
                </div>

            </div>

            <div className='mt-4'>
                <NavLink to="/profile">
                    <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700'>
                        PERFIL
                    </button>
                </NavLink>
            </div>

        </main>
    );
}


export default Home;
