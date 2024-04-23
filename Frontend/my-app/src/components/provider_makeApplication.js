import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import Swal from "sweetalert2";
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MakeApplication = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [sector, setSector] = useState('');
    const [subsector, setSubsector] = useState('');
    const today = new Date().toISOString().substr(0, 10);
    const [date, setDate] = useState(today);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const applicantId = useSelector((state) => state.data.id);
    const [location, setLocation] = useState(null);
    const [province, setProvince] = useState(null);
    const [showMap, setShowMap] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationCorrect, setLocationCorrect] = useState(true);
    const [manualLocation, setManualLocation] = useState('');

    console.log(location);
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
            setLocation(data.address.road + ", " + data.address.village);
            setProvince(data.address.province);

            console.log("ESTA ES LA CALLE: ", data);
            console.log("ñañañañaña ", data.address.province);
        }

        async function getLocationAndMap() {
            setLoading(true);

            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        var lat = position.coords.latitude;
                        var lon = position.coords.longitude;

                        setLatitude(lat);
                        setLongitude(lon);
                        fetchLocation(lat, lon);
                        // Solo crea el mapa si aún no está inicializado
                        if (!isMapInitialized('mapid')) {
                            var map = L.map('mapid').setView([lat, lon], 16);

                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '© OpenStreetMap contributors'
                            }).addTo(map);

                            // Utiliza un SVG como ícono del marcador
                            var svgIcon = L.icon({
                                iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>'),
                                iconSize: [38, 95], // Tamaño del ícono
                                iconAnchor: [22, 94], // Punto del ícono que corresponderá a la ubicación del marcador
                                popupAnchor: [-3, -76] // Dónde se mostrará el popup en relación al ícono
                            });

                            // Agrega el marcador con el ícono personalizado al mapa
                            L.marker([lat, lon], { icon: svgIcon }).addTo(map).bindPopup("¡Aquí estás!").openPopup();
                        }

                        if (!isTinyMapInitialized('mapidTiny')) {
                            var mapTiny = L.map('mapidTiny').setView([lat, lon], 16);

                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '© OpenStreetMap contributors'
                            }).addTo(mapTiny);

                            // Utiliza un SVG como ícono del marcador
                            var svgIcon = L.icon({
                                iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>'),
                                iconSize: [38, 95], // Tamaño del ícono
                                iconAnchor: [22, 94], // Punto del ícono que corresponderá a la ubicación del marcador
                                popupAnchor: [-3, -76] // Dónde se mostrará el popup en relación al ícono
                            });

                            // Agrega el marcador con el ícono personalizado al mapa
                            L.marker([lat, lon], { icon: svgIcon }).addTo(mapTiny).bindPopup("¡Aquí estás!").openPopup();
                        }
                    }, (error) => {
                        console.error('Error getting location:', error);
                    });
                } else {
                    console.error('Geolocation is not supported by this browser.');
                }
            } catch (error) {

            } finally {
                setLoading(false);

            }

        }
        getLocationAndMap();
    }, []);

    function isMapInitialized(containerId) {
        var container = L.DomUtil.get(containerId);
        if (container != null && container._leaflet_id) {
            return true;
        }
        return false;
    }

    function isTinyMapInitialized(containerId) {
        var container = L.DomUtil.get(containerId);
        if (container != null && container._leaflet_id) {
            return true;
        }
        return false;
    }

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

        const formData = new FormData(); // Crea un objeto FormData vacío
        // Agrega los campos y valores al objeto FormData
        formData.append('applicantId', applicantId);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('image', image); // Agrega el archivo de imagen
        formData.append('sector', sector);
        formData.append('subsector', subsector);
        formData.append('province', province);
        formData.append('location', finalLocation);
        formData.append('date', date);

        console.log("form: ", formData);
        try {
            const response = await fetch(process.env.REACT_APP_LARAVEL_URL + '/api/makeApplication', {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                // body: JSON.stringify({ applicantId, title, description, image: formData, sector, subsector, province, location: finalLocation, date }),
                body: formData,
                
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                console.log('La solicitud se ha hecho correctamente');
                // navigate("/")
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

            console.log(data);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "The application completed correctly",
                showConfirmButton: false,
                timer: 3500,
            });
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false)
        }

    }

    return (
        // <main className='min-h-screen bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 items-center justify-center rounded-lg lg:h-full lg:m-5 '>
        <main className='min-h-screen bg-gradient-to-r from-gray-500 via-gray-400 to-gray-300 items-center justify-center rounded-lg lg:flex lg:h-full lg:m-5 lg:flex-row lg:items-start'>
            {isLoading && <div className="spinner">Cargando...</div>}

            {isLoggedIn ?


                <form enctype="multipart/form-data" className="flex w-full" onSubmit={handleSubmit}>
                    <div className='p-5 shadow-lg flex-1'>

                        <div className='flex items-center justify-center py-4 rounded-lg bg-gradient-to-r from-orange-400 via-orange-300 to-orange-300'>
                            <h1 className='text-xl font-bold'>SOLICITUD</h1>
                        </div>

                        <div className='p-5 rounded-lg '>
                            <div className='mt-5 relative h-10 w-full min-w-[200px]'>
                                <input
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    type="text" name="floating_title" id="floating_title" placeholder="Titulo "
                                    className='peer h-full w-full rounded-[7px] border border-blue-gray-200 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100'
                                    required
                                />
                                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                    Titulo
                                </label>
                            </div>

                            <div className='mt-5 relative h-24 w-full min-w-[200px]'>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className='textarea-class peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100'
                                ></textarea>
                                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                    Descripción
                                </label>
                                <br />
                            </div>

                            <div className='mt-5 '>
                                <h3>IMAGEN</h3>
                                <input
                                    type="file" name="image" accept="image/*"
                                    // value={image}
                                    onChange={(e) => setImage(e.target.files[0])}
                                    className=' h-full w-full '
                                ></input>
                                <br />
                            </div>

                            <div className="relative mt-5 flex flex-col items-center justify-center w-full min-w-[200px]">
                                <div>

                                    <h3 className='text-blue-gray-400 text-[15px] mb-2'>
                                        SECTOR
                                    </h3>
                                </div>
                                <div>
                                    <select
                                        value={`${subsector}:${sector}`}
                                        onChange={handleSubsectorChange}
                                        id='floatingSector'
                                        className="w-full max-w-xs px-3 py-2.5 border border-blue-gray-200 rounded-md text-sm text-blue-gray-700 focus:outline-none focus:border-gray-900 disabled:bg-blue-gray-50"
                                    >
                                        <option value="">Selecciona un Sector</option>

                                        <optgroup label="Servicios Médicos" className="bg-gray-50 text-gray-800" style={{ padding: '0.5rem 1rem' }}>
                                            <option value="Ambulancias:Servicios Médicos">Ambulancias</option>
                                            <option value="Paramedicos:Servicios Médicos">Paramedicos</option>
                                            <option value="Primeros auxilios:Servicios Médicos">Servicio de primeros auxilios</option>
                                        </optgroup>

                                        <optgroup label="Bomberos">
                                            <option value="Extincion de incendios:Bomberos">Extinción de incendios</option>
                                            <option value="Rescate de personas:Bomberos">Rescate de personas atrapadas</option>
                                            <option value="Materiales peligrosos:Bomberos">Control de materiales peligrosos</option>
                                        </optgroup>

                                        <optgroup label="Policia">
                                            <option value="Policia local:Policia">Policia local</option>
                                            <option value="Policia nacional:Policia">Policia Nacional</option>
                                            <option value="Servicios de emergencia policiales:Policia">Servicios de emergencia policiales</option>
                                        </optgroup>

                                        <optgroup label="Protección Civil">
                                            <option value="Asistencia en desastres naturales:Protección civil">Asistencia en desastres naturales</option>
                                            <option value="Evacuación de zonas de riesgo:Protección civil">Evacuación de zonas de riesgo</option>
                                            <option value="Coordinación de servicios de emergencia:Protección civil">Coordinación de servicios de emergencia</option>
                                        </optgroup>

                                        <optgroup label="Servicios de Agua y Saneamiento">
                                            <option value="Reparación de fugas de agua:Servicios de agua y saneamiento">Reparación de fugas de agua</option>
                                            <option value="Mantenimiento de redes de alcantarillado:Servicios de agua y saneamiento">Mantenimiento de redes de alcantarillado</option>
                                            <option value="Suministro de agua potable en emergencias:Servicios de agua y saneamiento">Suministro de agua potable en emergencias</option>
                                        </optgroup>

                                        <optgroup label="Servicios de Electricidad">
                                            <option value="Reparación de averías eléctricas:Servicios de electricidad">Reparación de averías eléctricas</option>
                                            <option value="Restauración del suministro eléctrico tras cortes:Servicios de electricidad">Restauración del suministro eléctrico tras cortes</option>
                                        </optgroup>

                                        <optgroup label="Recogida de Residuos y Limpieza Urbana">
                                            <option value="Recogida de basura:Recogida de residuos y limpieza urbana">Recogida de basura</option>
                                            <option value="Servicios de limpieza viaria y de espacios públicos:Recogida de residuos y limpieza urbana">Servicios de limpieza viaria y de espacios públicos</option>
                                            <option value="Recogida de residuos especiales:Recogida de residuos y limpieza urbana">Recogida de residuos especiales</option>
                                        </optgroup>

                                        <optgroup label="Servicios Sociales">
                                            <option value="Asistencia social y de apoyo a personas vulnerables:Servicios sociales">Asistencia social y de apoyo a personas vulnerables</option>
                                            <option value="Centros de acogida y albergues:Servicios sociales">Centros de acogida y albergues</option>
                                            <option value="Programas de asistencia alimentaria y de vivienda:Servicios sociales">Programas de asistencia alimentaria y de vivienda</option>
                                        </optgroup>

                                        <optgroup label="Servicios de Recogida de Poda y Residuos Verdes">
                                            <option value="Recogida de poda y residuos vegetales:Servicios de recogida de poda y residuos verdes">Recogida de poda y residuos vegetales</option>
                                            <option value="Gestión de parques y jardines:Servicios de recogida de poda y residuos verdes">Gestión de parques y jardines</option>
                                            <option value="Reciclaje y compostaje de residuos orgánicos:Servicios de recogida de poda y residuos verdes">Reciclaje y compostaje de residuos orgánicos</option>
                                        </optgroup>
                                    </select>
                                </div>

                            </div>

                            <div className="mt-5 bg-white p-4 shadow rounded-lg lg:hidden">
                                <h3 className="text-lg font-semibold text-gray-800 uppercase justify-center flex items-center mb-2">Localización</h3>
                                {locationCorrect ? (
                                    <p className="text-gray-600">{location}</p>
                                ) : (
                                    <div>
                                        <input
                                            value={manualLocation}
                                            onChange={(e) => setManualLocation(e.target.value)}
                                            type="text"
                                            placeholder="Introduce la ubicación manualmente"
                                            className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="mt-4">
                                    <h2 className="text-md font-medium text-gray-800 text-center">¿Es correcto?</h2>
                                    <div className="flex justify-center items-center mt-2">

                                        <div className="flex items-center mr-4">
                                            <input
                                                type="checkbox"
                                                id="yes-radio"
                                                name="locationCorrect"
                                                className="text-green-500 border-gray-300 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
                                                checked={locationCorrect === true}
                                                onChange={() => setLocationCorrect(true)}
                                            />
                                            <label htmlFor="yes-radio" className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer">Sí</label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="no-radio"
                                                name="locationCorrect"
                                                className="text-red-500 border-gray-300 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer"
                                                checked={locationCorrect === false}
                                                onChange={() => setLocationCorrect(false)}
                                            />
                                            <label htmlFor="no-radio" className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer">No</label>
                                        </div>
                                    </div>

                                    <div id="mapidTiny" className="mt-3 w-full" style={{ height: '250px' }}></div>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end items-end">
                                <input
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    type="date"
                                    disabled
                                    className="cursor-not-allowed bg-gray-200 border border-gray-300 text-gray-500 rounded-lg p-2 focus:outline-none focus:border-gray-500 focus:bg-white"
                                />
                            </div>

                            <div className="mt-8 justify-center ">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white font-bold py-2 px-4 rounded-full transition duration-150 ease-in-out"
                                >
                                    ENVIAR
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="hidden md:hidden lg:block lg:mt-5 lg:bg-white lg:p-5 lg:shadow lg:rounded-lg lg:ml-auto lg:h-full lg:w-6/12 lg:m-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Localización</h3>
                        {locationCorrect ? (
                            <p className="text-gray-600">{location}</p>
                        ) : (
                            <input
                                value={manualLocation}
                                onChange={(e) => setManualLocation(e.target.value)}
                                type="text"
                                placeholder="Introduce la ubicación manualmente"
                                className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                required
                            />
                        )}

                        <div className="mt-4">
                            <h2 className="text-md font-medium text-gray-800">¿La localización proporcionada es correcta?</h2>
                            <div className="flex items-center mt-2">
                                <label className="inline-flex items-center mr-6">
                                    <input
                                        type="radio"
                                        name="locationCorrect"
                                        className="form-radio text-indigo-600 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        checked={locationCorrect === true}
                                        onChange={() => setLocationCorrect(true)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Sí</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="locationCorrect"
                                        className="form-radio text-indigo-600 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        checked={locationCorrect === false}
                                        onChange={() => setLocationCorrect(false)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">No</span>
                                </label>
                            </div>

                            <div id="mapid" className="h-full" style={{ height: '400px' }}>
                            </div>
                        </div>
                    </div>
                </form>

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
        </main >
    );
}


export default MakeApplication;
