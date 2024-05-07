import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { store, actions } from './store';
import { NavLink } from 'react-router-dom';
import Swal from "sweetalert2";
// import userImage from "../../public/userButtonImage"

const Home = ({ socket }) => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const isUser = useSelector((state) => state.isUser);
    const isWorker = useSelector((state) => state.isWorker);
    const isAdmin = useSelector((state) => state.isAdmin);
    const applicationOngoing = useSelector((state) => state.applicationOngoing);
    const applicationNodeOngoing = useSelector((state) => state.applicationNodeOngoing);

    const [imageVisible, setImageVisible] = useState(true);


    const checkApplicationOngoing = localStorage.getItem('persist:root');
    console.log("La de NODE:", applicationNodeOngoing);
    console.log("La normal:", applicationOngoing);



    useEffect(() => {

        async function estoVa() {
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listApplications', {
                method: 'GET',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                // body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            console.log(data);

        }

        async function comprobar() {

            if (isWorker) {
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


                    // console.log("SEGURO??? ", applicationNodeOngoing);

                } else {
                    console.log('La variable del Local Storage está vacía');
                }
            }

        }
        comprobar();
        estoVa();

        socket.on("connect", () => {
            console.log("Conectado al servidor");
            console.log("SOCKET HOME: ", socket.id);

        });

    }, [checkApplicationOngoing]);



    useEffect(() => {
        // Configura un temporizador para cambiar la animación
        const timer = setTimeout(() => {
            setImageVisible(false);
        }, 2000); // Duración de la imagen visible antes de comenzar a desvanecerse

        return () => clearTimeout(timer);
    })

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

    const reiniciarEstados = async (e) => {
        dispatch(actions.applicationOngoingCompleted())
    }

    return (
        <main className='min-h-screen flex flex-col items-center relative'>
            <div className='z-10'>
                <div className='text-center pt-5'>
                    <h1 className='text-5xl font-bold mb-4'>CivicAid</h1>
                    {/* <button onClick={() => reiniciarEstados()}>
                        REINICIAR
                    </button> */}
                </div>

                {/* {isUser ?
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
                    </div> */}

                {isUser ?

                    <div className='w-screen bg-black'>

                        <div className=' h-[340px] bg-violet-700'>
                            <div className='h-full w-full overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group border-b-4 '>
                                <NavLink to="/makeApplication">
                                    <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                        <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                HACER SOLICITUD
                                            </button>
                                        </div>
                                        <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            Envía solicitudes para informar a los sectores sobre cómo pueden ayudar
                                        </p>
                                    </div>
                                </NavLink>
                                <img src="userButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                            </div>

                            <div className='h-full w-full overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group '>
                                <NavLink to="/profile">
                                    <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                        <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                PERFIL
                                            </button>
                                        </div>
                                        <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            Gestiona tu perfil y haz un seguimiento del estado de tus solicitudes
                                        </p>
                                    </div>
                                </NavLink>
                                <img src="workerButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                            </div>
                        </div>

                        {/* <div className='flex text-center h-[200px] bg-fuchsia-950 group relative overflow-hidden border-t-2'>
                            <NavLink to="/profile">
                                <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full absolute">
                                    <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                        <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                            PERFIL
                                        </button>
                                    </div>
                                    <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                        Gestiona tu perfil
                                    </p>
                                </div>
                            </NavLink>
                            <img src="adminButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                        </div> */}

                    </div>
                    :

                    <div></div>
                }

                {isWorker ?
                    <div>
                        {applicationOngoing || applicationNodeOngoing ?

                            <div className='w-screen bg-black'>

                                <div className='flex h-[340px] lg:h-full bg-violet-700'>
                                    <div className='h-full w-6/12 overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
                                        <NavLink to="/manageApplications">
                                            <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                                <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                        MOSTRAR SOLICITUDES ASIGNADAS
                                                    </button>
                                                </div>
                                                <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    Comprueba las solicitudes que los administradores te han asignado
                                                </p>
                                            </div>
                                        </NavLink>
                                        <img src="userButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                    </div>

                                    <div className='h-full w-6/12 overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
                                        <NavLink to="/applicationOngoing">
                                            <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                                <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                        SOLICITUD ACTIVA
                                                    </button>
                                                </div>
                                                <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    Gestiona la ultima solicitud que aceptaste
                                                </p>
                                            </div>
                                        </NavLink>
                                        <img src="workerButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                    </div>
                                </div>

                                <div className='flex text-center h-[250px] bg-fuchsia-950 group relative overflow-hidden'>
                                    <NavLink to="/workerProfile">
                                        <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full absolute">
                                            <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                    PERFIL
                                                </button>
                                            </div>
                                            <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                Gestiona tu perfil y haz un seguimiento del estado de tus solicitudes
                                            </p>
                                        </div>
                                    </NavLink>
                                    <img src="adminButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                </div>
                            </div>

                            :
                            <div className='w-screen bg-black'>

                                <div className=' h-[340px] bg-violet-700'>
                                    <div className='h-full w-full overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group border-b-4 '>
                                        <NavLink to="/manageApplications">
                                            <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                                <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                        MOSTRAR SOLICITUDES ASIGNADAS
                                                    </button>
                                                </div>
                                                <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    Comprueba las solicitudes que los administradores te han asignado
                                                </p>
                                            </div>
                                        </NavLink>
                                        <img src="userButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                    </div>

                                    <div className='h-full w-full overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group '>
                                        <NavLink to="/workerProfile">
                                            <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                                <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                        PERFIL
                                                    </button>
                                                </div>
                                                <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                                    Gestiona tu perfil y haz un seguimiento del estado de tus solicitudes
                                                </p>
                                            </div>
                                        </NavLink>
                                        <img src="workerButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                    </div>
                                </div>
                            </div>

                        }
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
                            <NavLink to="/assignApplications">
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

                {applicationNodeOngoing ?
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
                        {/* <br />
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
                        </div> */}
                    </div>

                    :

                    <div className='w-screen bg-black'>

                        <div className='flex h-[340px] lg:h-full bg-violet-700'>
                            <div className='h-full w-6/12 overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
                                <NavLink to="/login">
                                    <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                        <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                CIUDADANO
                                            </button>
                                        </div>
                                        <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            Inicia sesión como usuario y envía solicitudes para informar a los sectores sobre cómo pueden ayudar
                                        </p>
                                    </div>
                                </NavLink>
                                <img src="userButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                            </div>

                            <div className='h-full w-6/12 overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
                                <NavLink to="/loginWorker">
                                    <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                        <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                EMPLEADO
                                            </button>
                                        </div>
                                        <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            Inicia sesión como empleado y comprueba las solicitudes que se te han asignado
                                        </p>
                                    </div>
                                </NavLink>
                                <img src="workerButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                            </div>
                        </div>

                        <div className='flex text-center h-[250px] bg-fuchsia-950 group relative overflow-hidden'>
                            <NavLink to="/loginAdmin">
                                <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full absolute">
                                    <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                        <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                            ADMINISTRADOR
                                        </button>
                                    </div>
                                    <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                        Inicia sesión como administrador y comprueba las nuevas solicitudes y asignalas a los empleados
                                    </p>
                                </div>
                            </NavLink>
                            <img src="adminButtonImage.png" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                        </div>

                    </div>
                }
            </div>
        </main>
    );
}


export default Home;
