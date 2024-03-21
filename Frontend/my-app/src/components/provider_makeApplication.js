import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import Swal from "sweetalert2";

const MakeApplication = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sector, setSector] = useState('');
    const [subsector, setSubsector] = useState('');
    const today = new Date().toISOString().substr(0, 10);
    const [date, setDate] = useState(today);
    // const [messageError, setMessageError] = useState("Error");
    const [error, setError] = useState(null);
    // const seleccionaOpcion = "Selecciona un sector";
    const [isLoading, setLoading] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const applicantId = useSelector((state) => state.data.id);
    const [location, setLocation] = useState(null);
    const [province, setProvince] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationCorrect, setLocationCorrect] = useState(true);
    const [manualLocation, setManualLocation] = useState('');

    useEffect(() => {
        async function fetchLocation(lat, lon) {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
            const data = await response.json();
            setLocation(data.address.road);
            setProvince(data.address.province);

            console.log("ESTA ES LA CALLE: ", data);
            console.log("ñañañañaña ", data.address.province);
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLatitude(position.coords.latitude);
                        setLongitude(position.coords.longitude);
                        fetchLocation(position.coords.latitude, position.coords.longitude);
                    },

                    (error) => {
                        console.error('Error getting location:', error);
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
            }
        }

        getLocation();
    }, []);


    const handleSubsectorChange = (e) => {
        const value = e.target.value;
        // Dividir el valor seleccionado en el valor del subsector y el valor del sector
        const [subsectorValue, sectorValue] = value.split(':');

        // Actualizar los estados con los valores del subsector y sector seleccionados
        setSubsector(subsectorValue);
        setSector(sectorValue);

        console.log(subsectorValue, sectorValue);

        console.log("ESTA ES LA ID DEL USUARIO: ", applicantId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const finalLocation = locationCorrect ? location : manualLocation;

        try {
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/makeApplication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ applicantId, title, description, sector, subsector, province, location: finalLocation, date }),
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                console.log('La solicitud se ha hecho correctamente');
                navigate("/")
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "The application did not completed correctly. Please try again",
                    html: "Remember to fill correctly all the fields",
                    showConfirmButton: false,
                    timer: 3500,
                });

            }
            const data = await response.json();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "The application completed correctly",
                showConfirmButton: false,
                timer: 3500,
            });
        } catch (error) {
            setError(error);
        } finally{
            setLoading(false)
        }

    }

    return (
        <main className='min-h-screen bg-gray-100 items-center justify-center'>
            {isLoggedIn ?
                <div>
                    <h1 className='text-xl font-bold m-auto'>SOLICITUD</h1>
                    <br />

                    <form onSubmit={handleSubmit}>
                        <div>
                            <h1>PROVINCIA ::::::: {province}</h1>
                            <h2>Titulo</h2>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" name="floating_title" id="floating_title" placeholder=" " required />

                            <h3>Descripción</h3>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

                            <h3>Sector</h3>
                            <select value={`${subsector}:${sector}`} onChange={handleSubsectorChange}>
                                <option value="">Selecciona un sector</option>
                                <optgroup label="Servicios Médicos">
                                    <option value="Ambulancias:Servicios Médicos">Ambulancias</option>
                                    <option value="Paramedicos:Servicios Médicos">Paramedicos</option>
                                    <option value="Primeros auxilios:Servicios Médicos">Servicio de primeros auxilios</option>
                                </optgroup>
                                <optgroup label="Bomberos">
                                    <option value="Extincion de incendios:Bomberos">Extinción de incendios</option>
                                    <option value="Rescate de personas:Bomberos">Rescate de personas atrapadas</option>
                                    <option value="Materiales peligrosos:Bomberos">Control de materiales peligrosos</option>
                                </optgroup>
                            </select>
                            {/* <select value={subsector} onChange={handleSubsectorChange}>
                                <option value="" disabled>Selecciona un sector</option>
                                <optgroup label="Servicios Médicos">
                                    <option value="Ambulancias:Servicios Médicos">Ambulancias</option>
                                    <option value="Paramedicos:Servicios Médicos">Paramedicos</option>
                                    <option value="Primeros auxilios:Servicios Médicos">Servicio de primeros auxilios</option>
                                </optgroup> */}

                            {/* 
                            <optgroup label="Policia">
                                <option value="policiaLocal">Policia Local</option>
                                <option value="policiaNacional">Policia Nacional</option>
                                <option value="emergenciasPoliciales">Servicios de emergencias policiales</option>
                            </optgroup> */}
                            {/* </select> */}
                            {/* <h3>Subsector seleccionado: {subsector}</h3> */}

                            <div>
                                <h3>Location</h3>
                                {locationCorrect ? (
                                    <p>{location}</p>
                                ) : (
                                    <input
                                        value={manualLocation}
                                        onChange={(e) => setManualLocation(e.target.value)}
                                        type='text'
                                        placeholder='Introduce la ubicación manualmente'
                                        required
                                    />
                                )}

                                <div>
                                    <h2>La localización proporcionada es correcta?</h2>
                                    <div>
                                        Si
                                        <input
                                            type='radio'
                                            name='locationCorrect'
                                            checked={locationCorrect === true}
                                            onChange={() => setLocationCorrect(true)}
                                        />
                                    </div>
                                    <div>
                                        No
                                        <input
                                            type='radio'
                                            name='locationCorrect'
                                            checked={locationCorrect === false}
                                            onChange={() => setLocationCorrect(false)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <h3>Date</h3>
                            <input value={date} onChange={(e) => setDate(e.target.value)} type='date' disabled />

                            <br />
                            <button type='submit'>SUBMIT</button>
                        </div>
                    </form>

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
        </main>
    );
}


export default MakeApplication;
