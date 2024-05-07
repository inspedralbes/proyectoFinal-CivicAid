import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { store, actions } from './store';
import Swal from "sweetalert2";

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

    console.log(applicationOngoing);
    console.log(applicationNodeOngoing);

    // { console.log("EXPLANATION: ", explanation) }

    useEffect(() => {

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
                    console.log("DATA??: ", data);
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



    useEffect(() => {
        socket.emit("register", workerId);

        // socket.emit('requestCurrentText', workerId);

        socket.on('textUpdate', (updatedText) => {
            setExplanation(updatedText);
        });

    }, [socket]);

    socket.on('textUpdate', (updatedText) => {
        // console.log(updatedText);
        setExplanation(updatedText);
        forceUpdate();

    });

    const handleTextChange = (event) => {
        console.log("/////", applicationNodeOngoingInfo);
        const newText = event.target.value;
        setExplanation(newText);
        socket.emit('updateText', {
            writer: workerId,
            newText: newText,
            users: applicationNodeOngoingInfo.workers,
        });
    };


    const handleSubmit = async (e) => {
        // e.preventDefault();
        setLoading(true);
        // const applicationStatus = 'completed';

        try {
            // const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/updateApplicationStatus/${applicationOngoing.id}`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     body: JSON.stringify({ applicationStatus }),
            // });

            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + `/api/applicationCompleted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationId: applicationFetch.id, workerId, applicationExplanation }),
            });

            // data = await response.json();
            // console.log("DATATATATATATATA", data);
            const data = await response.json();

            console.log("DATATATATAT: ", data);
            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                console.log('El estado de la solicitud se ha actualizado correctamente');
                dispatch(actions.applicationOngoingCompleted());
                navigate("/");

                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "The application status did not updated correctly. Please try again",
                    // html: "Remember to fill correctly all the fields",
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

    const handleNodeSubmit = async (e) => {
        // e.preventDefault();
        setLoading(true);

        socket.emit("applicationNodeCompleted", {
            token: token,
            applicationId: applicationNodeOngoingInfo.id,
            workerId: applicationNodeOngoingInfo.workers,
            applicationExplanation: explanation
        });
    }

    socket.on("applicationNodeCompletedConfirmation", (data) => {
        console.log("COMPLETED? ", data.completed);

        if (data.completed) {
            dispatch(actions.applicationNodeOngoingCompleted());

            navigate("/");
        }
    })

    return (
        <main className="h-screen overflow-auto flex justify-center items-center lg:bg-orange-300">
            {isWorker ?
                <div className='h-full w-full bg-gray-800'>
                    <nav className=" bg-opacity-30 border-b-4 border-orange-600 p-4">
                        <div className="flex justify-center">
                            <button className="text-gray-300 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 font-medium text-xl cursor-pointer">
                                SOLICITUD ACEPTADA
                            </button>
                        </div>
                    </nav>

                    {appOngoing ?
                        <div className='lg:flex'>

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


                                // <div className="relative bg-white text-gray-700 shadow-lg overflow-y-auto flex flex-col h-screen w-full">
                                //     <div className='lg:w-6/12'>
                                //         <div className="p-4 flex justify-between items-center ">
                                //             <h5 className="text-xl font-medium uppercase tracking-normal text-blue-gray-900 m-auto">
                                //                 {applicationFetch.title}
                                //             </h5>
                                //         </div>

                                //         <div className="overflow-hidden shadow-lg relative">
                                //             <img src={applicationFetch.image} alt="Imagen solicitud" className="w-full h-48 object-cover" />
                                //             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                //         </div>

                                //         <div className="px-6 py-2 pb-5 border-b-2 border-gray-800">
                                //             <h2 className="text-lg font-semibold">Descripción</h2>
                                //             <p className="text-base font-light break-words">
                                //                 {applicationFetch.description}
                                //             </p>
                                //         </div>
                                //     </div>

                                //     <div className='lg:flex lg:w-6/12 mt-10 text-black relative h-24 w-full min-w-[200px] font-bold'>
                                //         <form onSubmit={() => handleSubmit()} >
                                //             <textarea
                                //                 onChange={(event) => setApplicationExplanation(event.target.value)}
                                //                 className='p-5 bg-gray-200 textarea-class resize-none peer h-32 w-full lg:w lg:flex rounded-[7px] border border-blue-gray-200 border-t-transparent bg px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100'
                                //                 placeholder="Añade aquí la explicación..."
                                //                 // rows="5"
                                //                 required
                                //             />
                                //             <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-black peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                //                 Descripción de la resolución de la solicitud
                                //             </label>
                                //             <div className="p-6">
                                //                 <button

                                //                     className="block w-full rounded-lg bg-gray-900 py-3.5 px-7 text-sm font-bold uppercase text-white shadow-md hover:shadow-lg transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:opacity-50"
                                //                     type="submit">
                                //                     COMPLETADA
                                //                 </button>
                                //             </div>
                                //         </form>
                                //     </div>
                                // </div>
                                <div className="relative bg-white text-gray-700 shadow-lg overflow-y-auto flex flex-col lg:flex-row h-screen w-full">
                                    <div className="lg:w-5/12 lg:mx-auto">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-xl m-auto font-medium uppercase tracking-normal text-blue-gray-900">
                                                {applicationFetch.title}
                                            </h5>
                                        </div>

                                        <div className="overflow-hidden shadow-lg relative">
                                            <img src={applicationFetch.image} alt="Imagen solicitud" className="w-full h-48 object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
                                        </div>

                                        <div className="px-6 py-2 pb-5 border-b-2 lg:border-0 border-gray-800">
                                            <h2 className="text-lg font-semibold">Descripción</h2>
                                            <p className="text-base font-light break-words">
                                                {applicationFetch.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="lg:w-5/12 lg:mx-auto text-black relative min-w-[200px] font-bold">
                                        <form onSubmit={() => handleSubmit()}>
                                            <textarea
                                                onChange={(event) => setApplicationExplanation(event.target.value)}
                                                className="p-5 lg:m-0 bg-gray-200 textarea-class resize-none peer h-32 lg:h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100"
                                                placeholder="Añade aquí la explicación..."
                                                required
                                            />
                                            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-black peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                                Descripción de la resolución de la solicitud
                                            </label>
                                            <div className="p-6">
                                                <button
                                                    className="block w-full rounded-lg bg-gray-900 py-3.5 px-7 text-sm font-bold uppercase text-white shadow-md hover:shadow-lg transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:opacity-50"
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


                    {applicationNodeOngoing ?
                        <div>
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
                                            {applicationNodeOngoingInfo.title}
                                        </h5>
                                    </div>
                                    <p className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                                        {applicationNodeOngoingInfo.description}
                                    </p>
                                    <h2>STATUS: {applicationNodeOngoingInfo.applicationStatus}</h2>
                                    {/* {console.log("IDIDIDIDID:", applicationFetch.id)} */}
                                    <h3 className='text-sm font-bold'>BREVE EXPLICACIÓN DE CÓMO SE HA SOLUCIONADO LA SOLICITUD</h3>
                                    <textarea value={explanation} onChange={handleTextChange} className='w-full mt-5 bg-gray-400'>
                                    </textarea>
                                </div>

                                <div className="p-6 pt-3">
                                    <button
                                        onClick={() => handleNodeSubmit()}
                                        className=" block w-full select-none rounded-lg bg-gray-900 py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                        type="submit">
                                        COMPLETADA
                                    </button>
                                </div>
                            </div>

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