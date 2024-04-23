import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const SAVEDATA = 'SAVE_DATA';
const WORKER = 'WORKER';
const ADMIN = 'ADMIN';
const USER = 'USER';
const GET_APPLICATION_INFO = 'GET_APPLICATION_INFO';
const GET_USERID = 'GET_USERID';
const GET_OTHERSINFO = 'GET_OTHERSINFO';
const GET_UPLOADED_APPLICATION_ID = 'GET_UPLOADED_APPLICATION_ID';
const GET_UPLOADED_APPLICATION_NAME = 'GET_UPLOADED_APPLICATION_NAME';
const APPLICATION_ONGOING = 'APPLICATION_ONGOING'
const APPLICATION_ONGOING_COMPLETED = 'APPLICATION_ONGOING_COMPLETED'
const CHECK_APP_ONGOING = 'CHECK_APP_ONGOING'
const APPLICATION_NODE_ONGOING = 'APPLICATION_NODE_ONGOING'
const APPLICATION_NODE_ONGOING_COMPLETED = 'APPLICATION_NODE_ONGOING_COMPLETED'

const initialState = {
    isLoggedIn: false,
    isWorker: false,
    isAdmin: false,
    isUser: false,

    // Booleano que controla si el empleado a aceptado una solicitud
    applicationOngoing: false,
    // Si el booleano es cierto, en esta variable, se alamacenará la solicitud y todo su información
    applicationOngoingInfo: {},

    // Booleano que controla si el empleado a aceptado una solicitud
    applicationNodeOngoing: false,
    // Si el booleano es cierto, en esta variable, se alamacenará la solicitud y todo su información
    applicationNodeOngoingInfo: {},


    // Variable en la que se almacenan todos los datos del usuario al hacer login
    data: {},

    applicationInfo: {},
    getUserId: {},
    dataOthers: {},
    uploadedApplicationId: {},
    uploadedApplicationName: {},
};

const persistConfig = {
    key: 'root',
    storage,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, isLoggedIn: true };

        case 'LOGOUT':
            return { ...state, isLoggedIn: false, isWorker: false, isUser: false, isAdmin: false, applicationOngoing: false, applicationNodeOngoing: false,data: {} };

        case 'SAVE_DATA':
            return { ...state, data: action.payload };

        case 'WORKER':
            return { ...state, isLoggedIn: true, isWorker: true };

        case 'ADMIN':
            return { ...state, isAdmin: true };

        case 'CHECK_APP_ONGOING':
            return { ...state, applicationOngoing: false, applicationOngoingInfo: {} };

        case 'USER':
            return { ...state, isUser: true };

        case 'APPLICATION_ONGOING':
            return { ...state, applicationOngoing: true, applicationOngoingInfo: action.payload };

        case 'APPLICATION_ONGOING_COMPLETED':
            return { ...state, applicationOngoing: false, applicationOngoingInfo: {} };

        case 'APPLICATION_NODE_ONGOING':
            return { ...state, applicationNodeOngoing: true, applicationNodeOngoingInfo: action.payload };

        case 'APPLICATION_NODE_ONGOING_COMPLETED':
            return { ...state, applicationNodeOngoing: false, applicationNodeOngoingInfo: {} };

        case 'GET_APPLICATION_INFO':
            return { ...state, applicationInfo: action.payload };

        case 'GET_USERID':
            return { ...state, getUserId: action.payload };

        case 'GET_OTHERSINFO':
            return { ...state, dataOthers: action.payload };

        case 'GET_UPLOADED_APPLICATION_ID':
            return { ...state, uploadedApplicationId: action.payload };

        case 'GET_UPLOADED_APPLICATION_NAME':
            return { ...state, uploadedApplicationName: action.payload };

        default:
            return state;
    }
};
const persistedReducer = persistReducer(persistConfig, reducer);

const store = createStore(persistedReducer);
const persistor = persistStore(store);

const actions = {
    login: () => ({ type: LOGIN }),
    logout: () => ({ type: LOGOUT }),
    saveData: (data) => ({ type: SAVEDATA, payload: data }),
    worker: () => ({ type: WORKER }),
    admin: () => ({ type: ADMIN }),
    checkAppOngoing: () => ({ type: CHECK_APP_ONGOING }),
    user: () => ({ type: USER }),

    applicationOngoing: (applicationOngoingInfo) => ({ type: APPLICATION_ONGOING, payload: applicationOngoingInfo }),
    applicationOngoingCompleted: () => ({ type: APPLICATION_ONGOING_COMPLETED }),
    
    applicationNodeOngoing: (applicationNodeOngoingInfo) => ({ type: APPLICATION_NODE_ONGOING, payload: applicationNodeOngoingInfo }),
    applicationNodeOngoingCompleted: () => ({ type: APPLICATION_NODE_ONGOING_COMPLETED }),

    saveApplicationInfo: (applicationInfo) => ({ type: GET_APPLICATION_INFO, payload: applicationInfo }),
    getUserId: (getUserId) => ({ type: GET_USERID, payload: getUserId }),
    dataOthers: (dataOthers) => ({ type: GET_OTHERSINFO, payload: dataOthers }),
    saveUploadedApplicationId: (uploadedApplicationId) => ({ type: GET_UPLOADED_APPLICATION_ID, payload: uploadedApplicationId }),
    saveUploadedApplicationName: (uploadedApplicationName) => ({ type: GET_UPLOADED_APPLICATION_NAME, payload: uploadedApplicationName }),

};

export { store, persistor, actions };
