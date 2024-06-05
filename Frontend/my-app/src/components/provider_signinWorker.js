import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, NavLink } from "react-router-dom";
import Swal from 'sweetalert2';

function SigninForm() {
    const [dni, setDni] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [secondSurname, setSecondSurname] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [sectors, setSectors] = useState([]);
    const [sector, setSector] = useState('');
    const [locations, setLocations] = useState([]);
    const [requestedLocation, setRequestedLocation] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const [previewUrl, setPreviewUrl] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProvinces() {

            try {
                const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listProvinces', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                const locationsArray = Object.values(data);

                setLocations(locationsArray)

            } catch (error) {
                console.error("ESTE ES EL ERROR: ", error);
            }

        }

        async function fetchSectors() {
            try {
                const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/listSectors', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                const sectorsArray = Object.values(data);

                setSectors(sectorsArray)

            } catch (error) {
                console.error("ESTE ES EL ERROR: ", error);
            }

        }

        fetchProvinces();
        fetchSectors()
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    function validarDNI(dni) {
        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        const numero = dni.substring(0, dni.length - 1);
        const letra = dni.charAt(dni.length - 1).toUpperCase();

        if (!(/^\d{8}[A-Z]$/i.test(dni))) {
            // Verifica que el formato sea correcto: 8 números seguidos de una letra
            return false;
        }

        const letraCalculada = letras.charAt(parseInt(numero, 10) % 23);

        return letraCalculada === letra;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('dni', dni);
        formData.append('name', name);
        formData.append('surname', surname);
        formData.append('secondSurname', secondSurname);
        formData.append('profileImage', profileImage);
        formData.append('sector', sector);
        formData.append('requestedLocation', requestedLocation);
        formData.append('email', email);

        if (validarDNI(dni)) {

            try {
                const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/signinRequest', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                const data = await response.json();
                navigate("/")
                Swal.fire({
                    position: "bottom-end",
                    icon: "success",
                    title: "Tu solicitud se ha enviado correctamente. Un administrador gestionará tu solicitud lo antes posible.",
                    showConfirmButton: false,
                    timer: 6000,
                });

                setLoading(false);
            } catch (error) {
                Swal.fire({
                    position: "bottom-end",
                    icon: "error",
                    title: "Ha ocurrido un error durante la carga",
                    showConfirmButton: false,
                    timer: 1500,
                });
                setError(error);
                setLoading(false);
            }
        } else {
            Swal.fire({
                position: "bottom-end",
                icon: "error",
                title: "DNI incorrecto",
                showConfirmButton: false,
                timer: 1500,
            });
            setError(error);
            setLoading(false);
        }
    };

    return (
        <div className="overflow-y-auto overflow-hidden flex h-screen justify-center items-center lg:bg-orange-300">
            {isLoggedIn ?
                <p>
                    YA HAS INICIADO SESIÓN
                </p> :
                <div className="g-6 flex h-full flex-wrap items-center justify-center">
                    <div className="overflow-auto w-full h-screen lg:rounded-lg p-10 lg:pb-0 pt-2 bg-gray-800 shadow-lg dark:bg-neutral-800">
                        <NavLink to="/">
                            <div className="text-center">
                                <img
                                    className="m-auto w-4/5 lg:w-6/12"
                                    src="LogoPrincipal.png"
                                    alt="logo"
                                />
                            </div>
                        </NavLink>
                        <form className="pt-5 lg:w-full" onSubmit={handleSubmit} autoComplete="off">

                            <div className="lg:flex lg:space-x-6">
                                <div className="lg:w-1/2">
                                    <div className="relative z-0 w-full mb-6 group">
                                        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" type="text" name="floating_username" id="floating_username" className="block pt-4 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                        <label htmlFor="floating_username" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                            Nombre
                                        </label>
                                    </div>
                                    <div className="relative z-0 w-full mb-6 group">
                                        <input value={surname} onChange={(event) => setSurname(event.target.value)} autoComplete="off" type="text" name="floating_surname" id="floating_surname" className="block pt-4 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                        <label htmlFor="floating_surname" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                            Apellido
                                        </label>
                                    </div>
                                </div>
                                <div className="lg:w-1/2">
                                    <div className="relative z-0 w-full mb-6 group">
                                        <input value={secondSurname} onChange={(event) => setSecondSurname(event.target.value)} autoComplete="off" type="text" name="floating_secondSurname" id="floating_secondSurname" className="block pt-4 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                        <label htmlFor="floating_secondSurname" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                            Segundo Apellido
                                        </label>
                                    </div>
                                    <div className="relative z-0 w-full mb-4 group">
                                        <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" type="email" name="floating_email" id="floating_email" className="block pt-4 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                        <label htmlFor="floating_email" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                            Email
                                        </label>
                                        <a className="text-neutral-500">
                                            (Ej: civicaid@gmail.com).
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-0 w-full mb-6 group">
                                <input value={dni} onChange={(event) => setDni(event.target.value)} autoComplete="off" type="text" name="floating_dni" id="floating_dni" className="block pt-4 px-0 w-full text-sm text-white  bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                <label htmlFor="floating_dni" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    DNI
                                </label>
                            </div>

                            <div className="mt-5 border-2 border-dashed p-6 rounded-lg shadow bg-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Imagen de perfil</h3>
                                <div className="flex flex-col sm:flex-row items-center justify-center w-full">
                                    {!previewUrl ? (
                                        <label className="relative cursor-pointer bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-400 transition duration-300 ease-in-out flex flex-col items-center justify-center">
                                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                            <span className="text-base leading-normal">Seleccionar imagen</span>
                                            <input type='file' name="image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </label>
                                    ) : (
                                        <div className="flex flex-col items-center sm:flex-row justify-center">
                                            <img src={previewUrl} alt="Vista previa" className="w-32 h-32 rounded-full mt-2 object-cover" />
                                            <label className="relative cursor-pointer bg-gradient-to-r from-gray-600 to-gray-600 text-white font-semibold py-4 px-6 mt-4 sm:mt-0 sm:ml-4 rounded-lg shadow-lg hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-400 transition duration-300 ease-in-out flex flex-col items-center justify-center">
                                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                                <span className="text-base text-center leading-normal">Seleccionar imagen diferente</span>
                                                <input type='file' name="image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative z-0 w-full mt-6 mb-6 group max-w-xs lg:max-w-fit">
                                <h3 className="text-white text-[15px] mb-2 font-semibold">
                                    SECTOR
                                </h3>
                                <div className="relative">
                                    <select
                                        value={sector}
                                        onChange={(event) => setSector(event.target.value)}
                                        className="block w-full appearance-none bg-gray-700 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-orange-500">
                                        <option className="font-bold" value="">Selecciona una opción</option>
                                        {sectors.map((sector) => (
                                            <option key={sector.id} value={sector.sector}>{sector.sector}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7 10l5 5 5-5H7z" /></svg>
                                    </div>
                                </div>
                            </div>


                            <div className="relative z-0 w-full mb-6 group max-w-xs lg:max-w-fit">
                                <h3 className="text-white text-[15px] mb-2 font-semibold">
                                    LOCALIZACIÓN
                                </h3>
                                <div className="relative">
                                    <select
                                        value={requestedLocation}
                                        onChange={(event) => setRequestedLocation(event.target.value)}
                                        className="block w-full appearance-none bg-gray-700 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-orange-500">
                                        <option className='font-bold' value="">Selecciona una opción</option>
                                        {locations.map((location) => (
                                            <option key={location.id} value={location.name}>{location.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7 10l5 5 5-5H7z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    className="relative bg-gradient-to-r from-orange-400 to-orange-800 mb-3 w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                                    type="submit" disabled={isLoading}
                                    data-te-ripple-init
                                    data-te-ripple-color="light"
                                >
                                    {isLoading ? (
                                        <div role="status">
                                            <svg aria-hidden="true" className="inline-flex items-center w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <p>
                                            REGISTRARSE
                                        </p>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-end pt-4 lg:pt-1">
                                <p className="mb-0 mr-2 text-white">
                                    YA TIENE CUENTA?
                                </p>
                                <NavLink to="/loginWorker">
                                    <button
                                        className="group relative h-10 w-36 border-2 overflow-hidden rounded-lg bg-transparent uppercase font-bold text-lg shadow"
                                        data-te-ripple-init data-te-ripple-color="light"
                                    >
                                        <div className="absolute inset-0 w-3 bg-orange-400 transition-all duration-[500ms] ease-out group-hover:w-full"></div>
                                        <span className="relative text-white group-hover:text-black ">
                                            LOGEARSE
                                        </span>
                                    </button>
                                </NavLink>
                            </div>
                        </form>
                    </div>
                </div>
            }
        </div>
    )
}

export default SigninForm;