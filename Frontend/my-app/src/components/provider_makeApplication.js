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
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const applicantId = useSelector((state) => state.data.id);
    const [location, setLocation] = useState(null);
    const [province, setProvince] = useState(null);
    const [showMap, setShowMap] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationCorrect, setLocationCorrect] = useState(true);
    const [manualLocation, setManualLocation] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    console.log(location);
    useEffect(() => {
        async function fetchLocation(lat, lon) {
            setLoading(true);

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

            setLoading(false);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
        setLoadingSubmit(true);
        const finalLocation = locationCorrect ? location : manualLocation;

        const formData = new FormData();
        formData.append('applicantId', applicantId);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('image', image);
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
                    position: "bottom-end",
                    icon: "error",
                    title: "La solicitud no se enviado correctamente. Por favor, vuelve a intentarlo",
                    html: "Recuerda rellenar los campos correctamente",
                    showConfirmButton: false,
                    timer: 3500,
                });

            }
            const data = await response.json();

            console.log(data);
            Swal.fire({
                position: "bottom-end",
                icon: "success",
                title: "La solicitud se ha completado correctamente. Un administrador gestionará tu solicitud lo antes posible.",
                showConfirmButton: false,
                timer: 10000,
            });
            navigate("/")

        } catch (error) {
            setError(error);
        } finally {
            setLoadingSubmit(false)
        }

    }

    return (
        // <main className='min-h-screen bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 items-center justify-center rounded-lg lg:h-full lg:m-5 '>
        <main className='overflow-hidden min-h-screen bg-gray-800 items-center justify-center lg:flex lg:h-full lg:flex-row lg:items-start'>
            {isLoading &&
                <div className="fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                    <div role="status">
                        <svg aria-hidden="true" className=" inline-flex items-center w-12 h-48 mr-2 text-black animate-spin dark:text-gray-600 fill-orange-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            }

            {/* {isLoggedIn ? */}


            <form encType="multipart/form-data" className="flex w-full" onSubmit={handleSubmit}>
                <div className='px-5 mt-5 flex-1'>

                    <div className='flex items-center justify-center py-4 rounded-lg bg-gradient-to-r from-orange-400 via-orange-300 to-orange-300'>
                        <h1 className='text-xl font-bold'>SOLICITUD</h1>
                    </div>

                    <div className='mt-5 p-5 border-t-4  border-orange-600'>
                        <div className='text-white font-bold mt-5 relative h-10 w-full min-w-[200px]'>
                            <input
                                value={title} onChange={(e) => setTitle(e.target.value)}
                                type="text" name="floating_title" id="floating_title"
                                className='peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100'
                                autoComplete="off"
                                required
                                maxLength={20} // Limitar la cantidad de caracteres a 20

                            />
                            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-white peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                Titulo
                            </label>
                        </div>

                        <div className='text-white mt-5 relative h-24 w-full min-w-[200px] font-bold'>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className='textarea-class resize-none peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-orange-300 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 placeholder:opacity-0 focus:placeholder:opacity-100'
                            ></textarea>
                            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[15px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-white peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-orange-300 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-orange-300 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                Descripción
                            </label>
                            <br />
                        </div>

                        <div className="relative mt-5 flex flex-col items-center justify-center w-full min-w-[200px]">
                            <div>
                                <h3 className='text-white text-[15px] mb-2'>
                                    SECTOR
                                </h3>
                            </div>
                            <div className="relative w-full max-w-xs">
                                <select
                                    value={`${subsector}:${sector}`}
                                    onChange={handleSubsectorChange}
                                    id='floatingSector'
                                    className="w-full px-3 py-2.5 border border-blue-gray-200 rounded-md text-sm text-blue-gray-700 focus:outline-none focus:border-gray-900 disabled:bg-blue-gray-50"
                                    placeholder='Seleccionar un Sector'
                                >
                                    <option className='text-center' value="">Selecciona un Sector</option>

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

                        <div className='mt-5 bg-white p-6 rounded-lg shadow'>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Cargar Imagen</h3>
                            <div className="flex flex-col sm:flex-row items-center justify-center w-full">
                                {!previewUrl ?
                                    <label className="flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-gray-400 hover:text-white transition-colors duration-300 ease-in-out">
                                        <svg className="w-8 h-8 mb-2 sm:mb-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="text-base leading-normal">Seleccionar una imagen</span>
                                        <input type='file' name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    :
                                    <div className="flex flex-col items-center sm:flex-row justify-center">
                                        <img src={previewUrl} alt="Vista previa" className="max-w-64 lg:max-w-32 lg:max-h-32 lg:px-3 mt-2 lg:rounded-lg" />
                                        <label className="lg:h-full flex flex-col items-center px-4 py-6 mt-4 ml-0 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-gray-400 hover:text-white transition-colors duration-300 ease-in-out">
                                            <svg className="w-8 h-8 mb-2 sm:mb-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className=" text-base text-center leading-normal">Seleccionar imagen diferente</span>
                                            <input type='file' name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                }
                            </div>
                        </div>



                        <div className="mt-5 bg-white p-4 shadow rounded-lg lg:hidden">
                            <h3 className="text-lg font-semibold text-gray-800 uppercase justify-center flex items-center mb-2">Localización</h3>
                            {locationCorrect ? (
                                <p className="text-gray-600">{location}</p>
                            ) : (
                                <div className="relative mt-3">
                                    <input
                                        value={manualLocation}
                                        onChange={(e) => setManualLocation(e.target.value)}
                                        type="text"
                                        placeholder="Introduce la ubicación manualmente"
                                        className="form-input block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition duration-300 ease-in-out"
                                        required
                                    />
                                </div>

                            )}

                            <div className="block max-w-full mt-4">
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
                                {isLoadingSubmit ? (
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline-flex items-center w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                        <span className="sr-only"></span>
                                    </div>
                                ) : (
                                    <p>
                                        ENVIAR
                                    </p>
                                )}
                            </button>
                        </div>
                    </div>

                </div>

                <div className="hidden md:hidden lg:block lg:mt-5 lg:bg-white lg:px-5 lg:py-2 lg:shadow lg:rounded-lg lg:ml-auto lg:h-11/12 lg:w-6/12 lg:m-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Localización</h3>
                    {locationCorrect ? (
                        <p className="text-gray-600">{location}</p>
                    ) : (
                        <div className="relative mt-3">
                            <input
                                value={manualLocation}
                                onChange={(e) => setManualLocation(e.target.value)}
                                type="text"
                                placeholder="Introduce la ubicación manualmente"
                                className="form-input block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition duration-300 ease-in-out"
                                required
                            />
                        </div>

                    )}

                    <div className="mt-4 -z-50 max-h-48">
                        <div>
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

                            <div id="mapid" className="" style={{ height: '550px' }}></div>
                        </div>
                    </div>
                </div>
            </form>

            {/* :

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
            } */}
        </main >
    );
}


export default MakeApplication;
