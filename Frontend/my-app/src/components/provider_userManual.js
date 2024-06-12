import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { store, actions } from './store';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

import { NavLink } from 'react-router-dom';
import Swal from "sweetalert2";

/**
 * Componente que renderiza el manual de usuario
 * @returns 
 */
const UserManual = () => {

    return (
        <main className="h-screen overflow-auto flex justify-center items-center lg:bg-orange-300">
            <div className="container overflow-auto h-full w-full lg:w-9/12 lg:rounded-lg bg-gray-800 shadow-lg dark:bg-neutral-800">

                <div className="m-3 bg-gray-700 p-6 rounded-lg">
                    <h1 className="text-2xl text-center text-white font-bold">Manual de Usuario</h1>
                    <p className="text-white text-center mb-6">A continuación se presentan las instrucciones para el uso de la aplicación</p>

                    <nav className="mb-8">
                        <h2 className="text-xl text-white font-semibold">Índice</h2>
                        <ul className="list-disc list-inside text-white ml-4 space-y-2">
                            <li>Rol de ciudadano</li>
                            <li>Rol de empleado</li>
                            <li>Rol de administrador</li>
                        </ul>
                    </nav>

                    <section id="ciudadano" className="mb-8">
                        <h3 className="text-xl text-white font-semibold">Rol de ciudadano</h3>
                        <p className="text-white">El ciudadano podrá únicamente:</p>
                        <ul className="list-disc list-inside text-white ml-4 mb-4 space-y-2">
                            <li>Crear solicitudes</li>
                            <li>Hacer un seguimiento de su solicitud</li>
                        </ul>

                        <div className="mb-6">
                            <h4 className="text-lg text-white font-medium">Crear solicitudes</h4>
                            <p className="text-white mb-2">Para crear una solicitud, ve a la página principal de la aplicación y haz clic en <NavLink to="/makeApplication" className="text-orange-300">HACER SOLICITUD</NavLink>. Una vez dentro, te preguntará si quieres que acceda a tu ubicación. Permítelo, si estás de acuerdo, y rellena el formulario con la información necesaria y haz clic en "Enviar".</p>
                            <img src="permitirUbicacion.png" alt="manual1" className="lg:w-1/4 mb-4 mx-auto" />
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg text-white font-medium">Seguimiento de Solicitud</h4>
                            <p className="text-white mb-2">Para hacer un seguimiento de la solicitud enviada, ve a <NavLink to="/profile" className="text-orange-300">PERFIL</NavLink>. Una vez dentro, haz clic en "Historial de solicitudes" y podrás ver el estado de la(s) solicitud(es).</p>
                            <img src="historialSolicitudes.png" alt="manual1" className="lg:w-3/5 mb-4 mx-auto" />
                        </div>
                    </section>

                    <section id="empleado" className="mb-8">
                        <h3 className="text-xl text-white font-semibold">Rol de empleado</h3>
                        <p className="text-white">El empleado podrá únicamente:</p>
                        <ul className="list-disc list-inside text-white ml-4 mb-4 space-y-2">
                            <li>Ver solicitudes asignadas por el administrador</li>
                            <li>Gestionar sus propias solicitudes</li>
                        </ul>

                        <div className="mb-6">
                            <h4 className="text-lg text-white font-medium">Iniciar sesión</h4>
                            <p className="text-white mb-2">Para poder iniciar sesión como empleado debes:</p>
                            <ul className="list-disc list-inside text-white ml-4 mb-2 space-y-2">
                                <li>Mandar una <NavLink to="/signinWorker" className="text-orange-300">SOLICITUD DE REGISTRO</NavLink>. Es simplemente un formulario para mandar tus datos de empleado al administrador.</li>
                                <li>Una vez mandada la Solicitud de Registro, un administrador comprobará si la información que has puesto es correcta y verídica.</li>
                                <li>Si el administrador acepta tu Solicitud de Registro, te llegará un email con tu contraseña a la dirección de correo electrónico que pusiste en la Solicitud de Registro.</li>
                                <li>Con tu DNI, correo y contraseña podrás iniciar sesión.</li>
                            </ul>
                            <img src="emailSolicitudAceptada.png" alt="manual1" className="lg:w-2/5 mb-4 mx-auto" />
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg text-white font-medium">Gestión propia de solicitudes asignadas</h4>
                            <p className="text-white mb-2">Primero, para ver las solicitudes que los administradores te han asignado debes ir a <NavLink to="/manageApplications" className="text-orange-300">Gestionar Solicitudes</NavLink>. Una vez dentro, podrás ver las solicitudes asignadas, tanto las privadas como las compartidas.</p>
                            <ul className="list-disc list-inside text-white ml-4 mb-2 space-y-2">
                                <li>Solicitudes privadas: Son las solicitudes que solo te han asignado a ti. Si le das a "Comenzar", la solicitud pasará a estar en estado "En proceso" y se abrirá un nuevo apartado en la página principal en el que podrás ver la información de la solicitud y marcarla como finalizada.</li>
                                <li>Solicitudes compartidas: Son las solicitudes que te han asignado a ti y a otros empleados. En estas solicitudes no hay botón de "Comenzar" sino de "Invitar". El primer empleado que le dé a "Invitar", mandará una invitación a los demás empleados asignados a la solicitud para que se unan a la solicitud. A los empleados invitados, el botón de "Invitar" se les cambiará por un botón de "Aceptar Invitación". Si la aceptas, entrarás en una sala de espera con los demás usuarios. El empleado que haya iniciado la invitación, el anfitrión, es el que debe dar a "Iniciar Solicitud". Así se os abrirá un nuevo apartado en la página principal en el que podrás ver la información de la solicitud y marcarla como finalizada.</li>
                            </ul>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg text-white font-medium">Solicitudes asignadas</h4>
                            <p className="text-white mb-2">En el apartado de <NavLink to="/manageApplications" className="text-orange-300">SOLICITUDES ASIGNADAS</NavLink> puedes ver todas las solicitudes que se te han asignado y el estado en el que se encuentran.</p>
                        </div>
                    </section>

                    <section id="administrador">
                        <h3 className="text-xl text-white font-semibold">Rol de administrador</h3>
                        <p className="text-white">El administrador podrá únicamente:</p>
                        <ul className="list-disc list-inside text-white ml-4 mb-4 space-y-2">
                            <li>Ver y gestionar solicitudes de registro de empleados</li>
                            <li>Asignar solicitudes a empleados</li>
                        </ul>

                        <div className="mb-6">
                            <h4 className="text-lg text-white font-medium">Gestionar Solicitudes de Registro</h4>
                            <p className="text-white mb-2">Para gestionar las solicitudes de registro de empleados, ve a <NavLink to="/manageSigninRequests" className="text-orange-300">SOLICITUDES DE REGISTRO</NavLink>. Una vez dentro, haz clic en "Gestionar Solicitudes de Registro" y podrás ver todas las solicitudes de registro de empleados.</p>
                            <ul className="list-disc list-inside text-white ml-4 mb-2 space-y-2">
                                <li>Si le das a "Aceptar" la solicitud de registro, el empleado recibirá un email con su contraseña y podrá iniciar sesión.</li>
                                <li>Si le das a "Rechazar" la solicitud de registro, el empleado recibirá un email informándole de que su solicitud ha sido rechazada.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg text-white font-medium">Asignar solicitudes</h4>
                            <p className="text-white mb-2">Para asignar solicitudes a los empleados, ve a <NavLink to="/assignApplications" className="text-orange-300">ASIGNAR SOLICITUDES</NavLink>. Una vez dentro, podrás ver todas las solicitudes que han creado los ciudadanos y asignarlas a los empleados que quieras. Gracias a los datos que se muestran sobre los empleados, podrás asignar la solicitud al empleado más conveniente.</p>
                        </div>
                    </section>
                </div>
            </div>
        </main>


    );

}



export default UserManual;