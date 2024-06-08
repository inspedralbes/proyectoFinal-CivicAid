import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { store, actions } from './store';
import { NavLink } from 'react-router-dom';
import Swal from "sweetalert2";

const Home = ({ socket }) => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const isUser = useSelector((state) => state.isUser);
    const isWorker = useSelector((state) => state.isWorker);
    const isAdmin = useSelector((state) => state.isAdmin);
    const applicationOngoing = useSelector((state) => state.applicationOngoing);
    const applicationNodeOngoing = useSelector((state) => state.applicationNodeOngoing);

    const [imageVisible, setImageVisible] = useState(true);

    const images = ['tendiendoMano.png', 'haciendoSolicitud.png', 'arreglandoPanelElectrico.png', 'administrador.png'];
    const descriptions = [
        'CivicAid es una plataforma dedicada a brindar asistencia a los ciudadanos en diversas situaciones. Desde reportar problemas en la comunidad hasta solicitar ayuda en casos de emergencia, CivicAid facilita la comunicación entre los residentes y las autoridades pertinentes.',
        'Una vez que los usuarios envían una solicitud a través de CivicAid, esta es recibida y revisada por un administrador. El administrador evalúa la situación y determina el curso de acción adecuado para abordar la solicitud de manera eficiente.',
        'Después de recibir la solicitud, el administrador asigna la tarea a uno o más empleados capacitados. Estos empleados son responsables de llevar a cabo las acciones necesarias para resolver el problema reportado y brindar la asistencia requerida a los ciudadanos.',
        'Finalmente, una vez que la solicitud ha sido asignada, el empleado designado procede a ejecutar las acciones necesarias para abordar el problema reportado. Esto puede incluir reparaciones, servicios de emergencia o cualquier otra medida necesaria para satisfacer las necesidades del ciudadano.'
    ];

    const [currentImage, setCurrentImage] = useState(0);
    const [currentDescription, setCurrentDescription] = useState(0);

    const checkApplicationOngoing = localStorage.getItem('persist:root');


    useEffect(() => {
        socket.on("connect", () => {
            console.log("Conectado al servidor");

        });

    }, [checkApplicationOngoing]);


    useEffect(() => {
        const interval = setInterval(() => {
            nextImage();
        }, 10000);
        return () => clearInterval(interval);
    }, [currentImage]);

    function logout() {

        dispatch(actions.logout());
        localStorage.setItem('access_token', "0");
        Swal.fire({
            position: "bottom-end",
            icon: "info",
            title: "Has cerrado sesión correctamente",
            showConfirmButton: false,
            timer: 1500,
        });
    }

    const prevImage = () => {
        setCurrentImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <main className='min-h-screen lg:h-screen lg:overflow-hidden lg:bg-gray-800 flex flex-col items-center relative'>
            <div className='z-10 lg:flex lg:h-full lg:w-full'>
                <div className='w-full lg:w-5/12 lg:h-5/6 lg:m-auto bg-gray-700 lg:shadow-lg lg:rounded-lg'>
                    <div className='lg:mt-5 lg:h-full'>
                        <img src="logoPrincipal.png" className='h-28 w-full mb-2 lg:h-1/6 lg:w-6/12 lg:m-auto lg:rounded-lg' alt="Logo Principal" />

                        <div className="hidden lg:block relative lg:mt-5 lg:h-3/5 lg:mx-auto lg:w-11/12 lg:border-2 rounded-lg overflow-hidden">
                            {images.map((img, index) => (
                                <div key={index}>
                                    <img
                                        src={img}
                                        alt={`Imagen ${index + 1}`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                    <p className={`absolute inset-0 flex justify-center items-center px-12 py-10 text-white text-center bg-gray-800 bg-opacity-70 object-cover transition-opacity duration-500 ease-in-out ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}>
                                        {descriptions[index]}
                                    </p>
                                </div>
                            ))}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                {images.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 mx-2 rounded-full bg-gray-300 ${index === currentImage ? 'bg-gray-600' : ''}`}
                                    >
                                    </div>
                                ))}
                            </div>
                            <button onClick={prevImage} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 z-10 focus:outline-none focus:ring-2 focus:ring-white">
                                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <button onClick={nextImage} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 z-10 focus:outline-none focus:ring-2 focus:ring-white">
                                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {isWorker ?
                    <div className='lg:bg-orange-600 lg:w-6/12'>
                        {applicationOngoing || applicationNodeOngoing ?

                            <div className='w-screen lg:w-full lg:h-full bg-black'>

                                <div className='flex h-[340px] lg:h-3/6 bg-violet-700'>
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
                                        <img src="manageApplicationsButtonImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
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
                                        <img src="applicationOngoingButtonImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                    </div>
                                </div>

                                <div className='flex text-center h-[250px] lg:h-3/6 bg-fuchsia-950 group relative overflow-hidden'>
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
                                    <img src="profileButtonImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                </div>
                            </div>

                            :
                            <div className='w-screen h-screen lg:w-full lg:h-full'>

                                <div className='h-full lg:h-full'>
                                    <div className='h-2/5 w-full lg:h-3/6 overflow-hidden aspect-video bg-violet-500 cursor-pointer relative group border-b-4 '>
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
                                        <img src="manageApplicationsButtonImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                    </div>

                                    <div className='h-2/5 w-full lg:h-3/6 overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group '>
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
                                        <img src="profileButtonImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                                    </div>
                                </div>
                            </div>

                        }
                    </div>

                    :

                    <div></div>

                }

                {isLoggedIn ?

                    <div></div>

                    :

                    <div className='w-screen bg-yellow-300 lg:w-6/12 '>
                        <div className='flex h-[340px] lg:h-3/6 lg:w-full  '>
                            <div className='h-full w-6/12 lg:flex-1 overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
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

                            <div className='h-full w-6/12 lg:flex-1  overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
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

                        <div className='lg:h-3/6 text-center h-[250px] bg-fuchsia-950 group relative overflow-hidden'>
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


                {isUser ? (
                    <div className='w-full lg:w-6/12 lg:h-full bg-yellow-300'>
                        <div className='h-full lg:flex lg:flex-col'>
                            <div className='lg:flex-1 overflow-hidden bg-orange-400 cursor-pointer relative group'>
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

                            <div className='lg:flex-1 overflow-hidden bg-orange-200 cursor-pointer relative group'>
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
                                <img src="profileButtonImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}



                {isAdmin ?
                    <div className='w-screen bg-yellow-300 lg:w-6/12 '>
                        <div className='flex h-[340px] lg:h-3/6 lg:w-full  '>
                            <div className='h-full w-6/12 lg:flex-1 overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
                                <NavLink to="/manageSigninRequests">
                                    <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                        <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                SOLICITUDES DE REGISTRO
                                            </button>
                                        </div>
                                        <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            Gestiona las solicitudes de registro que han dejado los empleados
                                        </p>
                                    </div>
                                </NavLink>
                                <img src="signinRequestsImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                            </div>

                            <div className='h-full w-6/12 lg:flex-1  overflow-hidden aspect-video bg-orange-400 cursor-pointer relative group'>
                                <NavLink to="/assignApplications">
                                    <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full">
                                        <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                                ASIGNAR SOLICITUDES
                                            </button>
                                        </div>
                                        <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                            Asigna a los empleados las solicitudes que han dejado los usuarios
                                        </p>
                                    </div>
                                </NavLink>
                                <img src="assignApplicationsImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                            </div>
                        </div>

                        <div className='lg:h-3/6 text-center h-[250px] bg-fuchsia-950 group relative overflow-hidden'>
                            <NavLink to="/adminProfile">
                                <div className="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-center items-center h-full absolute">
                                    <div className='text-center text-white text-xl transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                        <button className='py-3 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all duration-300'>
                                            Perfil
                                        </button>
                                    </div>
                                    <p className='mt-4 text-white text-center transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'>
                                        Gestiona tu perfil
                                    </p>
                                </div>
                            </NavLink>
                            <img src="profileButtonImage.jpg" alt="Imagen Ciudadano" className="object-cover w-full h-full aspect-square group-hover:scale-110 transition duration-300 ease-in-out opacity-50" />
                        </div>

                    </div>


                    :

                    <div></div>
                }



            </div>
        </main>
    );
}


export default Home;
