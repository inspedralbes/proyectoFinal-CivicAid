import { useSelector, useDispatch } from 'react-redux';
import { actions } from './store';
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Swal from "sweetalert2";

const UserInfo = () => {
    const isLoggedIn = useSelector(state => state.isLoggedIn);
    const token = localStorage.getItem('access_token');
    const userInfo = useSelector((state) => state.data);
    const workerInfo = useSelector((state) => state.data);
    const [showModal, setShowModal] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [applicationModalInfo, setApplicationModalInfo] = useState([]);
    const [acceptedSignInRequests, setAcceptedSignInRequests] = useState([]);
    const [assignedApplications, setAssignedApplications] = useState([]);
    const [requestModal, setRequestModal] = useState(null);

    const isUser = useSelector((state) => state.isUser);
    const adminId = useSelector((state) => state.data.id);
    const [ownApplications, setOwnApplications] = useState([]);

    const isAdmin = useSelector((state) => state.isAdmin);
    const workerId = useSelector((state) => state.data.id);
    const [applicationsAssigned, setApplicationsAssigned] = useState([]);
    const [sharedApplicationsAssigned, setSharedApplicationsAssigned] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);


    const [activeTab, setActiveTab] = useState("tab1");

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleApplicationModal = (application) => {
        setShowApplicationModal(true);
        setApplicationModalInfo(application)
    };

    useEffect(() => {
        async function acceptedRequests() {
            if (isAdmin) {
                setLoading(true)
                try {
                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listAcceptedSignInRequests', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ adminId }),
                    });
                    const data = await response.json();
                    setAcceptedSignInRequests(data)

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                } finally {
                    setLoading(false)
                }
            }
        }

        async function assignedApplications() {
            if (isAdmin) {
                setLoading(true)
                try {
                    const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listAssignedApplicationsWorkers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ adminId }),
                    });
                    const data = await response.json();
                    setAssignedApplications(data)

                } catch (error) {
                    console.error("ESTE ES EL ERROR: ", error);
                } finally {
                    setLoading(false)
                }
            }
        }

        acceptedRequests();
        assignedApplications();
    }, [])


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

        navigate("/")
    }


    return (
        <div className="overflow-auto h-screen w-screen flex justify-center items-center lg:bg-orange-300">
            {isAdmin ?
                <div className="overflow-auto container h-full w-full lg:w-9/12 lg:rounded-lg bg-gray-800 shadow-lg dark:bg-neutral-800">
                    <div className=" p-4 text-center text-white">
                        <nav className="backdrop-filter backdrop-blur-l bg-opacity-30 border-b-4 border-orange-600 p-4">
                            <div className="flex">
                                <li className={`w-6/12 list-none`}>
                                    <button onClick={() => handleTabClick("tab1")} className={` text-gray-300 text-xl hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 font-medium cursor-pointer p-4 ${activeTab === "tab1" ? "active bg-gray-700" : ""}`}>
                                        Informacion de usuario
                                    </button>
                                </li>

                                <li className={`w-6/12 my-auto list-none`}>
                                    <button onClick={() => handleTabClick("tab2")} className={`text-gray-300 text-xl hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 font-medium cursor-pointer ${activeTab === "tab2" ? "active bg-gray-700" : ""}`}>
                                        Solicitudes gestionadas
                                    </button>
                                </li>

                            </div>
                        </nav>

                        {loading ?
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div role="status" className="flex items-center justify-center mt-20">
                                    <svg aria-hidden="true" className="inline-flex w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                </div>
                            </div>

                            :

                            <div className=''>

                                {activeTab === "tab1" && (
                                    <div className="mt-5 flex items-center justify-center">
                                        <div className="mt-5 container border-4 border-orange-500 bg-orange-300 rounded-lg md:w-[600px] w-full md:shadow-lg transform duration-200 easy-in-out">
                                            <div className="h-32 overflow-hidden" >
                                                <img className="w-full h-full object-cover"
                                                    src="profileBanner.jpg"
                                                    alt="Banner Img" />
                                            </div>
                                            <div className="bg-orange-200">
                                                <NavLink to="/" className="h-[20px] w-[20px] block pt-5 ml-5">
                                                    <button className="h-[20px] w-[20px]">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                                                        </svg>
                                                    </button>
                                                </NavLink>
                                                <div className='text-center text-black font-bold'>
                                                    <h3>ID de administrador: {workerInfo.id}</h3>
                                                </div>
                                                <div className="inline text-center px-14">
                                                    <h2 className="text-gray-800 text-3xl font-bold">{workerInfo.name} {workerInfo.surname} {workerInfo.secondSurname}</h2>
                                                    <p className="text-gray-800 font-semibold mt-2 cursor-default hover:text-blue-500">
                                                        {workerInfo.email}
                                                    </p>
                                                </div>
                                                <hr className="mt-6"></hr>
                                                <div className="flex bg-orange-400">
                                                    <button
                                                        onClick={() => setShowModal(true)}
                                                        className="text-center m-auto w-full p-4 hover:bg-orange-300 cursor-pointer"
                                                    >
                                                        <p>CERRAR SESIÓN</p>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "tab2" && (
                                    <div className="mt-5">
                                        <div className="">
                                            {/* Tabla de Solicitudes No Compartidas */}
                                            <h2 className="text-xl font-semibold mb-3">Solicitudes de registro aprovadas</h2>
                                            <table className="table-auto w-full border-collapse border border-t-0 border-b-0 border-r-0 border-l-0 border-gray-200 mb-6">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4">ID</th>
                                                        <th className="px-4">DNI</th>
                                                        <th className="px-4">Nombre</th>
                                                        <th className="px-4">Ubicación asignada</th>
                                                        <th className="px-4">Sector</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 ">
                                                    {acceptedSignInRequests.map((request, id) => (
                                                        <tr key={id} onClick={() => setRequestModal(request)} className='cursor-pointer hover:bg-gray-700'>
                                                            <td className="px-4 py-8 whitespace-nowrap">{request.id}</td>
                                                            <td className="px-4 py-8 whitespace-nowrap">{request.dni}</td>
                                                            <td className="px-4 py-8 whitespace-nowrap">{request.name} {request.surname}</td>
                                                            <td className="px-4 py-8 whitespace-nowrap">{request.assignedLocation}</td>
                                                            <td className="px-4 py-8 whitespace-nowrap">{request.sector}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-10">
                                            {/* Tabla de Solicitudes Compartidas */}
                                            <h2 className="text-xl font-semibold mb-3">Solicitudes Asignadas</h2>
                                            <table className="table-auto w-full border-collapse border border-t-0 border-b-0 border-r-0 border-l-0 border-gray-200 mb-6">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4">ID</th>
                                                        <th className="px-4">Título</th>
                                                        <th className="px-4">Ubicación</th>
                                                        <th className="px-4">Sector</th>
                                                        <th className="px-4">Fecha</th>
                                                        <th className="px-4">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {assignedApplications.map((application, id) =>
                                                    (<tr key={id} onClick={() => handleApplicationModal(application)} className='cursor-pointer hover:bg-gray-700 '>
                                                        <td className="px-4 py-8 whitespace-nowrap">{application.id}</td>
                                                        <td className="px-4 py-8 whitespace-nowrap">{application.title}</td>
                                                        <td className="px-4 py-8 whitespace-nowrap">{application.location}</td>
                                                        <td className="px-4 py-8 whitespace-nowrap">{application.sector}</td>
                                                        <td className="px-4 py-8 whitespace-nowrap">{application.date}</td>
                                                        <td className="px-4 py-8 whitespace-nowrap uppercase">{application.applicationStatus}</td>
                                                    </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }

                    </div>

                    {showModal && (
                        <div className="fixed z-10 inset-0 overflow-y-auto ease-in-out">
                            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>

                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12">
                                            {/* Icono de advertencia */}
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                                <g id="SVGRepo_iconCarrier">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M16.125 12C16.125 11.5858 15.7892 11.25 15.375 11.25L4.40244 11.25L6.36309 9.56944C6.67759 9.29988 6.71401 8.8264 6.44444 8.51191C6.17488 8.19741 5.7014 8.16099 5.38691 8.43056L1.88691 11.4306C1.72067 11.573 1.625 11.7811 1.625 12C1.625 12.2189 1.72067 12.427 1.88691 12.5694L5.38691 15.5694C5.7014 15.839 6.17488 15.8026 6.44444 15.4881C6.71401 15.1736 6.67759 14.7001 6.36309 14.4306L4.40244 12.75L15.375 12.75C15.7892 12.75 16.125 12.4142 16.125 12Z" fill="#000000"></path>
                                                    <path d="M9.375 8C9.375 8.70219 9.375 9.05329 9.54351 9.3055C9.61648 9.41471 9.71025 9.50848 9.81946 9.58145C10.0717 9.74996 10.4228 9.74996 11.125 9.74996L15.375 9.74996C16.6176 9.74996 17.625 10.7573 17.625 12C17.625 13.2426 16.6176 14.25 15.375 14.25L11.125 14.25C10.4228 14.25 10.0716 14.25 9.8194 14.4185C9.71023 14.4915 9.6165 14.5852 9.54355 14.6944C9.375 14.9466 9.375 15.2977 9.375 16C9.375 18.8284 9.375 20.2426 10.2537 21.1213C11.1324 22 12.5464 22 15.3748 22L16.3748 22C19.2032 22 20.6174 22 21.4961 21.1213C22.3748 20.2426 22.3748 18.8284 22.3748 16L22.3748 8C22.3748 5.17158 22.3748 3.75736 21.4961 2.87868C20.6174 2 19.2032 2 16.3748 2L15.3748 2C12.5464 2 11.1324 2 10.2537 2.87868C9.375 3.75736 9.375 5.17157 9.375 8Z" fill="#000000"></path>
                                                </g>
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">CERRAR SESIÓN</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    ¿Seguro que quieres cerrar sesión?
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button onClick={() => logout()} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                            Proceder
                                        </button>
                                        <button onClick={() => setShowModal(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showApplicationModal && (
                        <div className="fixed inset-0 z-50 overflow-y-hidden ease-in-out">
                            <div className="flex items-center justify-center min-h-screen text-center">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>

                                <div className="inline-block w-full max-w-lg p-6  overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                    <div className="relative overflow-hidden shadow-lg rounded-xl">
                                        <img src={applicationModalInfo.image} alt="Imagen representativa" className="w-full object-cover h-48 rounded-t-xl" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black opacity-50"></div>
                                    </div>
                                    <div className=" px-6 py-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{applicationModalInfo.title}</h3>
                                        <div>

                                            {applicationModalInfo.description}
                                        </div>
                                        <div className="mt-4 flex flex-wrap bg-gray-200 p-4 rounded-lg shadow-inner">
                                            <div className="w-full sm:w-1/2 px-2 mb-4">
                                                <div className="text-sm text-gray-700">
                                                    <strong className="block text-gray-900">Localización:</strong>
                                                    {applicationModalInfo.location}
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-1/2 px-2 mb-4">
                                                <div className="text-sm text-gray-700">
                                                    <strong className="block text-gray-900">Sector:</strong>
                                                    {applicationModalInfo.sector}
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-1/2 px-2 mb-4">
                                                <div className="text-sm text-gray-700">
                                                    <strong className="block text-gray-900">Fecha:</strong>
                                                    {applicationModalInfo.date}
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-1/2 px-2 mb-4">
                                                <div className="text-sm text-gray-700">
                                                    <strong className="block text-gray-900">Estado:</strong>
                                                    <span className="uppercase">{applicationModalInfo.applicationStatus}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Empleados asignados:</h3>
                                            {applicationModalInfo.workers.length > 0 ? (
                                                <div className="space-y-2">
                                                    {applicationModalInfo.workers.map((worker, id) => (
                                                        <div key={id} className="flex items-center p-2 bg-gray-50 rounded-md shadow-sm">
                                                            <img src={worker.profileImage} alt={`${worker.name} ${worker.surname}`} className="w-10 h-10 rounded-full mr-3" />
                                                            <div className="text-sm text-gray-700">
                                                                <p className="font-medium text-gray-900">{worker.name} {worker.surname}</p>
                                                                <p className="text-gray-600">{worker.sector}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No hay empleados asignados.</p>
                                            )}
                                        </div>

                                    </div>
                                    <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">

                                        <button onClick={() => setShowApplicationModal(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal */}
                    {requestModal && (
                        <div className="fixed inset-0 z-50 overflow-y-auto lg:mt-5">
                            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                {/* Overlay */}
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setRequestModal(null)}></div>

                                {/* Modal container */}
                                <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
                                    <div className='flex justify-between items-start p-4 border-b'>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles de la solicitud</h3>
                                        <div className='cursor-pointer p-2 rounded-md text-gray-400 hover:text-gray-600' onClick={() => setRequestModal(null)}>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img className="h-24 w-24 bg-orange-500 p-2 rounded-full" src={requestModal.profileImage} alt="" />
                                            <div className="space-y-1 font-medium">
                                                <div>{requestModal.name} {requestModal.surname} {requestModal.secondSurname}</div>
                                                <p className="text-sm text-gray-500">{requestModal.email}</p>
                                            </div>
                                        </div>
                                        <ul className="list-none space-y-2">
                                            <li><strong>DNI:</strong> {requestModal.dni}</li>
                                            <li><strong>Sector:</strong> {requestModal.sector}</li>
                                            <li><strong>Requested Location:</strong> {requestModal.requestedLocation}</li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

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


        </div >
    );
};

export default UserInfo;
