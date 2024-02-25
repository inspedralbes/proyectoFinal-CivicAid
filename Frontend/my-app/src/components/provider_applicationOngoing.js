import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';
import Swal from "sweetalert2";

const ApplicationOngoing = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const token = localStorage.getItem('access_token');
    const [applicationStatus, setApplicationStatus] = useState();
    const isWorker = useSelector((state) => state.isWorker);
    const applicationOngoing = useSelector((state) => state.applicationOngoingInfo);
    const appOngoing = useSelector((state) => state.applicationOngoing);
    

    // console.log("ESTE ES EL ID DE LA SOLICITUD ACEPTADA: ", applicationOngoing.id);
    // console.log("ESTE ES EL ESTADO DE LA SOLICITUD ACEPTADA: ", applicationOngoing.applicationStatus);
    // console.log("ES EMPLEADO? ", isWorker);
    // console.log("SOLICITUD EN MARCHA? ", appOngoing);

    const handleSubmit = async (e) => {
        // e.preventDefault();
        setLoading(true);


        try {
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateApplicationStatus/${applicationOngoing.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationStatus }),
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                console.log('El estado de la solicitud se ha actualizado correctamente');
                navigate("/")
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "The application status did not updated correctly. Please try again",
                    // html: "Remember to fill correctly all the fields",
                    showConfirmButton: false,
                    timer: 3500,
                });

            }
            const data = await response.json();

            console.log(data.applicationStatus);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "The application status updated correctly",
                showConfirmButton: false,
                timer: 3500,
            });
        } catch (error) {
            setError(error);
        }
    }

    return (
        <div>
            {isWorker && appOngoing ?
                <div className="relative flex w-full max-w-[26rem] p-5 mt-5 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg">
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
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="block font-sans text-xl antialiased font-medium leading-snug tracking-normal text-blue-gray-900">
                                {applicationOngoing.title}
                            </h5>
                        </div>
                        <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                            {applicationOngoing.description}
                        </p>
                    </div>
                    <div className="p-6 pt-3">

                        <select value={applicationStatus} onChange={(e) => setApplicationStatus(e.target.value)}>
                            <option value="">Selecciona un estado</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option vlaue="completed">Completed</option>
                        </select>
                    </div>

                    <div className="p-6 pt-3">
                        <button
                            onClick={() => handleSubmit()}
                            className=" block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="submit">
                            ACEPTAR
                        </button>
                    </div>
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
                                <NavLink to="/loginWorker" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-purple-800 rounded-lg hover:bg-purple-900 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
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
        </div>

    )
}

export default ApplicationOngoing;