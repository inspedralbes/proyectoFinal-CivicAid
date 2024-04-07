import express, { application } from "express";
import { Server } from "socket.io";
import http from "http";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();

const laravelUrl = process.env.LARAVEL_URL;
// console.log(laravelUrl);

const app = express();
const server = http.createServer(app);
const port = 7500;
const host = '0.0.0.0';


// Este mapa asocia los IDs de empleado con los IDs de socket
const employeeSocketMap = {};
let lobbies = [];

const io = new Server(server, {
    withCredentials: true,
    cors: {
        origin: true,
        credentials: true,
    },
    path: "/node/",
});

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado: ", socket.id);

    /**
     * Socket para "asociar" el ID del empleado con el ID del socket
     */
    socket.on("register", (employeeId) => {
        // employeeSocketMap[employeeId] = socket.id;
        employeeSocketMap[employeeId] = { socketId: socket.id, status: "connected" };

        // console.log("MAP: ", employeeSocketMap);
    });

    /**
     * SOCKET PARA PEDIR LAS SOLICITUDES COMPARTIDAS A LARAVEL
     */
    socket.on('fetchMultipleAssigned', async (data) => {
        const { isWorker, token, workerId } = data;
        // Asegurándonos de obtener el socketId correcto.
        const targetSocket = employeeSocketMap[workerId];
        const targetSocketId = targetSocket ? targetSocket.socketId : null;

        // console.log("ESTE ES EL TARGET:", targetSocketId);

        if (isWorker && targetSocketId) {
            try {
                const response = await fetch(`${laravelUrl}/api/listWorkersExactApplication`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ workerId }),
                });
                let fetchData = await response.json();

                // Iterar a través de cada aplicación para acceder a sus trabajadores
                fetchData.applications.forEach(application => {
                    // Agregar el estado del socket a cada trabajador en la aplicación
                    application.workers.forEach(worker => {
                        // Aquí cambiamos la lógica para marcar como 'inactive' por defecto si no está en employeeSocketMap
                        worker.status = employeeSocketMap[worker.id] ? employeeSocketMap[worker.id].status : 'inactive';
                    });
                });

                // Emitir los datos actualizados al cliente
                io.to(targetSocketId).emit("returnFetchMultipleAssigned", fetchData);

            } catch (error) {
                console.error("HA HABIDO UN ERROR EN fetchMultipleAssigned: ", error);
            }
        }
    });


    socket.on("get lobbies", () => {
        sendLobbyList();
    });

    socket.on("newLobby", (data) => {
        // console.log("ESTA ES LA DTTAA: ", data);
        // console.log("LOBBIES: ", lobbies);
        let lobby_exists = false;
        lobbies.forEach((element) => {
            if (element.lobby_code == data.lobby_code) {
                lobby_exists = true;
            }
        });

        if (!lobby_exists) {
            lobbies.push({
                lobby_code: data.lobby_code,
                maxUsers: data.maxUsers,
                lobbyCreator: data.lobbyCreator,
                users: [],
                applicationInfo: [],
                // created: new Date().getTime(),
            });
            sendLobbyList();
        }
    });


    /**
     * Socket para cuando un empleado de la al boton de invitar
     */
    socket.on("sendInvitation", (data) => {
        const hostSocketId = employeeSocketMap[data.hostId]; // ID de socket del host
        console.log("Socket ID del host: ", hostSocketId);
        console.log("DATA ", data);

        // data.assignedWorkers es un arreglo de objetos, cada uno tiene la propiedad 'id' para el workerId
        data.assignedWorkers.forEach(worker => { // Nota el cambio aquí, usamos 'worker' en lugar de 'workerId'
            const workerId = worker.id; // Accedemos al 'id' del trabajador aquí
            // Asegúrate de no enviar una invitación al host mismo
            if (workerId !== data.hostId) {
                const targetSocketId = employeeSocketMap[workerId];
                console.log("Procesando workerId:", workerId);
                if (targetSocketId) {
                    // Envía la invitación a cada trabajador asignado, excepto al host
                    io.to(targetSocketId).emit("invitationReceived", {
                        message: "Estás invitado",
                        invitation: true,
                        applicationId: data.applicationId
                    });
                }
            }
        });
    });

    /**
     * Socket para devolver el status online del trabajador para saber si está conectado
     */
    socket.on("returnWorkerStatus", (data) => {
        // Iterar sobre cada trabajador en data
        data.forEach(worker => {
            // Acceder a propiedades específicas de cada trabajador
            // console.log(`Worker ID: ${worker.id}`);

        });
    });

    // Manejador de eventos para desconexion
    socket.on("disconnect", () => {
        const workerId = Object.keys(employeeSocketMap).find(key => employeeSocketMap[key].socketId === socket.id);

        // Si se encuentra el ID del trabajador, actualiza su estado a "inactivo"
        if (workerId) {
            employeeSocketMap[workerId].status = "idle";
            console.log(`Empleado con ID ${workerId} desconectado y marcado como inactivo.`);
            console.log(employeeSocketMap);
        } else {
            console.log(`No se encontró el ID del trabajador asociado al socket ${socket.id}.`);
        }

        // console.log("Cliente desconectado: ", socket.id);
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
