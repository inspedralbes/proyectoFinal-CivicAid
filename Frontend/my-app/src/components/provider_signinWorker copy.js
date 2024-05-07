import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, NavLink } from "react-router-dom";
import Swal from 'sweetalert2';
// import logo from "../../public/logoPequeñoCivicAid.png"

function SigninForm() {
    const [dni, setDni] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [secondSurname, setSecondSurname] = useState('');
    const [sectors, setSectors] = useState([]);
    const [sector, setSector] = useState('');
    const [locations, setLocations] = useState([]);
    const [requestedLocation, setRequestedLocation] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
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

                // Convertimos el objeto en un arreglo utilizando Object.values()
                const locationsArray = Object.values(data);
                // Ahora puedes utilizar el método map en locationsArray
                locationsArray.map(location => {
                    // Hacer algo con cada ubicación
                    console.log(location.name);
                });
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
                // Convertimos el objeto en un arreglo utilizando Object.values()
                const sectorsArray = Object.values(data);
                // console.log(sectorsArray); // Esto imprimirá el arreglo de objetos
                // Ahora puedes utilizar el método map en locationsArray
                sectorsArray.map(sector => {
                    // Hacer algo con cada ubicación
                    console.log(sector.sector);
                });
                setSectors(sectorsArray)

            } catch (error) {
                console.error("ESTE ES EL ERROR: ", error);
            }

        }

        fetchProvinces();
        fetchSectors()
    }, []);


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

        if (validarDNI(dni)) {

            try {
                const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/signinRequest', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ dni, name, surname, secondSurname, sector, requestedLocation, email }),
                });
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                const data = await response.json();
                // if (data.isRegistered) {
                navigate("/")
                Swal.fire({
                    position: "bottom-end",
                    icon: "success",
                    title: "Your request has been succesfully registered",
                    showConfirmButton: false,
                    timer: 3500,
                });
                // }

                setLoading(false);
            } catch (error) {
                Swal.fire({
                    position: "bottom-end",
                    icon: "error",
                    title: "An error occurred while loading",
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
                title: "DNI mal amego",
                showConfirmButton: false,
                timer: 1500,
            });
            setError(error);
            setLoading(false);
        }
    };

    return (
        <div className="overflow-hidden flex h-screen justify-center items-center lg:bg-orange-300">
            {isLoggedIn ?
                <p>
                    YA HAS INICIADO SESIÓN
                </p> :
                <div className="container h-full w-full g-6 flex px-5 flex-wrap items-center justify-center lg:flex lg:flex-wrap lg:w-fit lg:rounded-lg md:px-0 text-neutral-800 dark:text-neutral-200 bg-gray-800 shadow-lg dark:bg-neutral-800">


                    <div className="h-full p-5 md:mx-6 md:p-12">
                        <div className="text-center">
                            <img
                                className="mx-auto w-48"
                                src="logoPequeñoCivicAid.png"
                                alt="jiji"
                            />
                        </div>

                        <form onSubmit={handleSubmit} className='mt-5'>
                            <div className="relative z-0 w-full mb-6 group">
                                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" type="text" name="floating_username" id="floating_username" className="block pt-4 px-0 w-full text-sm text-white  bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                <label htmlFor="floating_username" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    NOMBRE
                                </label>
                            </div>

                            <div className="relative z-0 w-full mb-6 group">
                                <input value={surname} onChange={(event) => setSurname(event.target.value)} autoComplete="off" type="text" name="floating_surname" id="floating_surname" className="block pt-4 px-0 w-full text-sm text-white  bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                <label htmlFor="floating_surname" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    APELLIDO
                                </label>
                            </div>

                            <div className="relative z-0 w-full mb-6 group">
                                <input value={secondSurname} onChange={(event) => setSecondSurname(event.target.value)} autoComplete="off" type="text" name="floating_secondSurname" id="floating_secondSurname" className="block pt-4 px-0 w-full text-sm text-white  bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                <label htmlFor="floating_secondSurname" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    SEGUNDO APELLIDO
                                </label>
                            </div>

                            <div className="relative z-0 w-full mb-6 group">
                                <input value={dni} onChange={(event) => setDni(event.target.value)} autoComplete="off" type="text" name="floating_dni" id="floating_dni" className="block pt-4 px-0 w-full text-sm text-white  bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                <label htmlFor="floating_dni" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    DNI
                                </label>
                            </div>

                            <div className="relative z-0 w-full mb-6 group">
                                <label htmlFor="floating_sector" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    SECTOR
                                </label>
                                <select value={sector} onChange={(event) => setSector(event.target.value)}>
                                    <option value="">Selecciona una opción</option>

                                    {sectors.map((sector) => (
                                        <option key={sector.id} value={sector.sector}>{sector.sector}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative z-0 w-full mb-6 group">
                                <label htmlFor="floating_location" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    LOCALIZACIÓN
                                </label>

                                <select value={requestedLocation} onChange={(event) => setRequestedLocation(event.target.value)}>
                                    <option value="">Selecciona una opción</option>

                                    {locations.map((location) => (
                                        <option key={location.id} value={location.name}>{location.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative z-0 w-full mb-6 group">
                                <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" type="email" name="floating_email" id="floating_email" className="block pt-4 px-0 w-full text-sm text-white  bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-orange-600 peer" placeholder=" " required />
                                <label htmlFor="floating_email" className="peer-focus:font-medium absolute text-xl text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 font-bold peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    EMAIL
                                </label>
                            </div>

                            <a className="text-neutral-500">
                                Tiene que tener '@' y un dominio (Ej: civicaid@gmail.com).
                            </a>

                            <div className=" mt-10 pb-1 pt-1 text-center">
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
                            <div className="flex mt-5 lg:mt-16 items-center justify-between">
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