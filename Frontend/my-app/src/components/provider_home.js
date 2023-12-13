import React, { useState } from 'react';
import { store, actions } from './store';
import { NavLink } from 'react-router-dom';

function Home() {
    return (
        <main className='min-h-screen bg-gray-100 items-center justify-center'>
            <div className='text-center pt-5'>
                <h1 className='text-5xl font-bold mb-4'>CivicAid</h1>
            </div>

            <div className='bg-white p-8 rounded shadow-md max-w-3xl w-full'>
                <div className='text-center'>
                    <NavLink to="/loginUsuario">
                        <button
                            className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                        >
                            MODO CIUIDADANO
                        </button>
                    </NavLink>

                </div>

                <br />

                <div className='text-center'>
                    <button
                        className='bg-blue-500 text-white p-2 rounded hover:bg-blue-700'
                    >
                        MODO PROFESIONAL
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
        </main>
    );
}


export default Home;
