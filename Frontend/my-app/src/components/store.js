import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// const LOGIN = 'LOGIN';
// const LOGOUT = 'LOGOUT';
// const SAVEDATA = 'SAVE_DATA';
// const GET_STORE_ITEMS = 'GET_STORE_ITEMS';
// const UPDATE_BOUGHT_ITEMS = 'UPDATE_BOUGHT_ITEMS';
// const GET_GAMEINFO = 'GET_GAMEINFO';
// const GET_PATHGAME = 'GET_PATHGAME';
// const GET_USERID = 'GET_USERID';
// const GET_OTHERSINFO = 'GET_OTHERSINFO';
// const GET_UPLOADED_GAME_ID = 'GET_UPLOADED_GAME_ID';
// const GET_UPLOADED_GAME_NAME = 'GET_UPLOADED_GAME_NAME';

const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const SAVEDATA = 'SAVE_DATA';
const WORKER = 'WORKER';
const GET_REQUESTINFO = 'GET_REQUESTINFO';
const GET_USERID = 'GET_USERID';
const GET_OTHERSINFO = 'GET_OTHERSINFO';
const GET_UPLOADED_REQUEST_ID = 'GET_UPLOADED_REQUEST_ID';
const GET_UPLOADED_REQUEST_NAME = 'GET_UPLOADED_REQUEST_NAME';

const initialState = {
    isLoggedIn: false,
    isWorker: false,
    data: {},
    requestInfo: {},
    getUserId: {},
    dataOthers: {},
    uploadedRequestId: {},
    uploadedRequestName: {},
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
            return { ...state, isLoggedIn: false, data: {} };
        case 'SAVE_DATA':
            return { ...state, data: action.payload };
        case 'WORKER':
            return { ...state, isLoggedIn: true };
        case 'GET_REQUESTINFO':
            return { ...state, requestInfo: action.payload };
        case 'GET_USERID':
            return { ...state, getUserId: action.payload };
        case 'GET_OTHERSINFO':
            return { ...state, dataOthers: action.payload };
        case 'GET_UPLOADED_REQUEST_ID':
            return { ...state, uploadedRequestId: action.payload };
        case 'GET_UPLOADED_REQUEST_NAME':
            return { ...state, uploadedRequestName: action.payload };
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
    saveRequestInfo: (requestInfo) => ({ type: GET_REQUESTINFO, payload: requestInfo }),
    getUserId: (getUserId) => ({ type: GET_USERID, payload: getUserId }),
    dataOthers: (dataOthers) => ({ type: GET_OTHERSINFO, payload: dataOthers }),
    saveUploadedRequestId: (uploadedRequestId) => ({ type: GET_UPLOADED_REQUEST_ID, payload: uploadedRequestId }),
    saveUploadedRequestName: (uploadedRequestName) => ({ type: GET_UPLOADED_REQUEST_NAME, payload: uploadedRequestName }),

};

export { store, persistor, actions };
