const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = 7500;
const host = '0.0.0.0';

let lobbies = [];

const io = require("socket.io")(server, {
    withCredentials: true,
    cors: {
        origin: true,
        credentials: true,
    },
    path: "/node/",
});

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado: ", socket.id);

    socket.on("get lobbies", () => {
        sendLobbyList();
    });

    socket.on("newLobby", (data) => {
        // console.log("ESTA ES LA DTTAA: ", data);
        let lobby_exists = false;
        lobbies.forEach((element) => {
            if (element.lobby_code == data.lobby_code) {
                lobby_exists = true;
            }
        });

        if (!lobby_exists) {
            const random = () => Math.random() - 0.5;
            lobbies.push({
                lobby_code: data.lobby_code,
                maxUsers: data.maxUsers,
                lobbyCreator: data.lobbyCreator,
                users: [],
                applicationInfo: [],
                created: new Date().getTime(),
            });
            // sendLobbyList();
        }
    });
    
    // Manejador de eventos para desconexion
    socket.on("disconnect", () => {
        console.log("Cliente desconectado: ", socket.id);
    });

    // Manejador de eventos para errores
    socket.on("error", (error) => {
        console.error("Error en el socket:", error);
    });
});

function sendLobbyList() {
    io.emit("lobbies list", lobbies);
}

server.listen(port, host, () => {
    console.log("Listening on " + host + ": " + port);
});
