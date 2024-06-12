import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';
import Swal from "sweetalert2";

/**
 * Componente que renderiza la vista de la solicitud en curso
 * @param {*} param0 
 * @returns 
 */
const ApplicationOngoing = ({ socket }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const token = localStorage.getItem('access_token');
    const workerId = useSelector((state) => state.data.id);
    const isWorker = useSelector((state) => state.isWorker);
    const applicationOngoing = useSelector((state) => state.applicationOngoingInfo);
    const applicationNodeOngoing = useSelector((state) => state.applicationNodeOngoing);
    const applicationNodeOngoingInfo = useSelector((state) => state.applicationNodeOngoingInfo);
    const appOngoing = useSelector((state) => state.applicationOngoing);
    const [applicationFetch, setApplicationFetch] = useState([]);
    const [applicationExplanation, setApplicationExplanation] = useState([]);
    const [explanation, setExplanation] = useState('');
    const [, forceUpdate] = useState();

    useEffect(() => {

        /**
         * Función que obtiene la solicitud en curso
         */
        async function fetchApplication() {
            if (isWorker && appOngoing) {
                try {
                    setLoading(true);

                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/checkOngoingApp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ applicationId: applicationOngoing.id }),
                    });
                    const data = await response.json();
                    setApplicationFetch(data[0]);

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchApplication();
    }, [applicationOngoing]);


    // Use effect para que cada vez que se actualice el texto de la solicitud en curso, se lo envíe a los demas empleados
    useEffect(() => {
        socket.emit("register", workerId);

        socket.on('textUpdate', (updatedText) => {
            setExplanation(updatedText);
        });

    }, [socket]);

    socket.on('textUpdate', (updatedText) => {
        setExplanation(updatedText);
        forceUpdate();

    });

    /**
     * Función que actualiza el texto de la solicitud en curso y lo envía a los demás empleados
     * @param {*} event 
     */
    const handleTextChange = (event) => {
        const newText = event.target.value;
        setExplanation(newText);
        socket.emit('updateText', {
            writer: workerId,
            newText: newText,
            users: applicationNodeOngoingInfo.workers,
        });
    };


    /**
     * Función que actualiza el estado de la solicitud en curso
     * @param {*} e 
     */
    const handleSubmit = async (e) => {
        setLoading(true);

        try {
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/applicationCompleted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationId: applicationFetch.id, workerId, applicationExplanation }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                console.log('El estado de la solicitud se ha actualizado correctamente');
                dispatch(actions.applicationOngoingCompleted());
                navigate("/");

                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "El estado de la solicitud no se ha podido actualizar. Por favor, vuelve a intentarlo.",
                    showConfirmButton: false,
                    timer: 3500,
                });

            }
            Swal.fire({
                position: "center",
                icon: "success",
                title: "La solicitud se ha completado correctamente",
                showConfirmButton: false,
                timer: 3500,
            });
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false)
        }
    }


    /**
     * Función que actualiza el estado de la solicitud compartida en curso
     * @param {*} e 
     */
    const handleNodeSubmit = async (e) => {

        socket.emit("applicationNodeCompleted", {
            token: token,
            applicationId: applicationNodeOngoingInfo.id,
            workerId: applicationNodeOngoingInfo.workers,
            applicationExplanation: explanation
        });

        // Swal.fire({
        //     position: "center",
        //     icon: "success",
        //     title: "La solicitud se ha completado correctamente",
        //     showConfirmButton: false,
        //     timer: 3500,
        // });
        
        // navigate("/");
    }

    // Socket que recibe la confirmación de que la solicitud compartida se ha completado
    socket.on("applicationNodeCompletedConfirmation", (data) => {

        if (data.completed) {
            dispatch(actions.applicationNodeOngoingCompleted());

            Swal.fire({
                position: "center",
                icon: "success",
                title: "La solicitud se ha completado correctamente",
                showConfirmButton: false,
                timer: 3500,
            });
            
            navigate("/");
        }
    })

    return (
        <main className="h-screen overflow-auto flex justify-center items-center lg:bg-orange-300">
            {isWorker ?
                <div className="container overflow-auto h-full w-full lg:w-9/12 lg:rounded-lg bg-gray-800 shadow-lg dark:bg-neutral-800">
                    <nav className="text-center backdrop-filter backdrop-blur-l bg-opacity-30 border-b-4 border-orange-600 p-4">
                        <div className="flex justify-center">
                            <button className="text-gray-300 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 font-medium text-xl cursor-pointer">
                                SOLICITUD ACEPTADA
                            </button>
                        </div>
                    </nav>

                    {/* DIV DE LAS SOLICITUDES PRIVADAS */}
                    {appOngoing ?
                        <div className='lg:flex lg:bg-orange-200'>

                            {isLoading ?
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                    <div role="status" className="flex items-center justify-center mt-20">
                                        <svg aria-hidden="true" className="inline-flex w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                    </div>
                                </div>

                                :

                                <div className="relative bg-white lg:bg-gray-800 lg:text-white  text-gray-700 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row lg:w-full lg:h-full lg:m-auto h-screen w-full">
                                    <div className="lg:w-5/12 lg:mx-auto lg:mt-5 lg:border-r-2 lg:pr-28">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-xl m-auto font-medium uppercase tracking-normal text-blue-gray-900">
                                                {applicationFetch.title}
                                            </h5>
                                        </div>

                                        <div className="overflow-hidden lg:mt-5 shadow-lg relative">
                                            <img src={applicationFetch.image} alt="Imagen solicitud" className="w-full h-48 object-cover rounded-md" />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                        </div>

                                        <div className="px-6 py-2 pb-5 lg:p-0 lg:mt-5 border-b-2 lg:border-0 border-gray-800">
                                            <p className="text-base font-light break-words">
                                                {applicationFetch.description}
                                            </p>
                                        </div>

                                        <div className='hidden lg:flex justify-center'>
                                            <div className="lg:w-6/12 lg:mx-auto lg:border-r-2 lg:border-white lg:border-b-0 px-6 py-2 pb-5 lg:p-0 lg:mt-5 border-b-2 border-gray-800">
                                                <h2 className="text-lg font-semibold text-center">ID del solicitante</h2>
                                                <p className="text-base font-light break-words text-center">
                                                    {applicationFetch.applicantId}
                                                </p>
                                            </div>

                                            <div className="lg:w-6/12 px-6 py-2 pb-5 lg:p-0 lg:mt-5 border-b-2 lg:border-0 border-gray-800">
                                                <h2 className="text-lg font-semibold text-center">Estado de la solicitud</h2>
                                                <p className="text-base font-light break-words text-center uppercase">
                                                    {applicationFetch.applicationStatus}
                                                    {applicationFetch.applicationStatus === "active" && (
                                                        <span className="inline-block ml-2 w-3 h-3 bg-green-700 rounded-full"></span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 lg:w-5/12 lg:mx-auto lg:mt-10 relative min-w-[200px] font-bold">
                                        <form onSubmit={() => handleSubmit()} className=''>
                                            <textarea
                                                onChange={(event) => setApplicationExplanation(event.target.value)}
                                                className="text-black p-5 lg:p-7 lg:m-0 bg-gray-200 textarea-class resize-none peer h-32 lg:h-80 w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100"
                                                placeholder="Añade aquí la explicación..."
                                                required
                                            />
                                            <label className="text-black before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-black peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                                Descripción de la resolución de la solicitud
                                            </label>
                                            <div className="p-6">
                                                <button
                                                    className="block w-full rounded-lg bg-gradient-to-r from-orange-400 to-orange-800 py-3.5 px-7 text-sm font-bold uppercase text-white shadow-md hover:shadow-lg transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:opacity-50"
                                                    type="submit"
                                                >
                                                    COMPLETADA
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            }
                        </div>

                        :

                        <div></div>
                    }


                    {/* DIV DE LAS SOLICITUDES COMPARTIDAS */}
                    {applicationNodeOngoing ?
                        <div className='lg:flex lg:w-full lg:bg-orange-200'>

                            {isLoading ?
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                    <div role="status" className="flex items-center justify-center mt-20">
                                        <svg aria-hidden="true" className="inline-flex w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                    </div>
                                </div>

                                :

                                <div className=" relative bg-white lg:bg-gray-800 lg:rounded-xl rounded-t-none lg:text-white  text-gray-700 shadow-lg overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row lg:w-full lg:m-auto h-screen w-full">
                                    <div className="lg:w-5/12 lg:mx-auto lg:mt-5 lg:border-r-2 lg:pr-28">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-xl m-auto font-medium uppercase tracking-normal text-blue-gray-900">
                                                {applicationNodeOngoingInfo.title}
                                            </h5>
                                        </div>

                                        <div className="overflow-hidden lg:mt-5 shadow-lg relative">
                                            <img src={applicationNodeOngoingInfo.image} alt="Imagen solicitud" className="w-full h-48 object-cover rounded-md" />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                        </div>

                                        <div className="px-6 py-2 pb-5 lg:p-0 lg:mt-5 border-b-2 lg:border-0 border-gray-800">
                                            <h2 className="text-lg font-semibold">Descripción</h2>
                                            <p className="text-base font-light break-words">
                                                {applicationNodeOngoingInfo.description}
                                            </p>
                                        </div>

                                        <div className='hidden lg:flex justify-center'>
                                            <div className="lg:w-6/12 lg:mx-auto lg:border-r-2 lg:border-white lg:border-b-0 px-6 py-2 pb-5 lg:p-0 lg:mt-5 border-b-2 border-gray-800">
                                                <h2 className="text-lg font-semibold text-center">ID del solicitante</h2>
                                                <p className="text-base font-light break-words text-center">
                                                    {applicationNodeOngoingInfo.applicantId}
                                                </p>
                                            </div>

                                            <div className="lg:w-6/12 px-6 py-2 pb-5 lg:p-0 lg:mt-5 border-b-2 lg:border-0 border-gray-800">
                                                <h2 className="text-lg font-semibold text-center">Estado de la solicitud</h2>
                                                <p className="text-base font-light break-words text-center uppercase">
                                                    ACTIVE 
                                                    <span className="inline-block ml-2 w-3 h-3 bg-green-700 rounded-full"></span>
                                                    
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 lg:w-5/12 lg:mx-auto lg:mt-10 relative min-w-[200px] font-bold">
                                        <form onSubmit={() => handleNodeSubmit()} className=''>
                                            <textarea
                                                value={explanation} onChange={handleTextChange}
                                                className="text-black p-5 lg:p-7 lg:m-0 bg-gray-200 textarea-class resize-none peer h-32 lg:h-80 w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100"
                                                placeholder="Añade aquí la explicación..."
                                                required
                                            />
                                            <label className="text-black text-xs before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-black peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                                Descripción de la resolución de la solicitud
                                            </label>
                                            <div className="p-6">
                                                <button
                                                    className="block w-full rounded-lg bg-gradient-to-r from-orange-400 to-orange-800 py-3.5 px-7 text-sm font-bold uppercase text-white shadow-md hover:shadow-lg transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:opacity-50"
                                                    type="submit"
                                                >
                                                    COMPLETADA
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            }
                        </div>

                        :

                        <div></div>
                    }

                    {applicationOngoing === false && applicationNodeOngoing === false ?
                        <div className='w-full h-full z-50 bg-white'>
                            <h1>NO HAS ACEPTADO NINGUNA SOLICITUD TODAVÍA</h1>
                        </div>

                        :

                        <div></div>
                    }
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
        </main>

    )
}

export default ApplicationOngoing;