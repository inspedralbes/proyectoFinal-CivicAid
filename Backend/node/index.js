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
        employeeSocketMap[employeeId] = { socketId: socket.id };

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

                // Emitir los datos actualizados al cliente
                io.to(targetSocketId).emit("returnFetchMultipleAssigned", fetchData);

            } catch (error) {
                console.error("HA HABIDO UN ERROR EN fetchMultipleAssigned: ", error);
            }
        }
    });

    /**
     * Socket para cuando un empleado de la al boton de invitar
     */
    socket.on("sendInvitation", (data) => {
        // Obtener el objeto del host que contiene el socketId, no solo el socketId
        const hostSocket = employeeSocketMap[data.hostId];
        console.log("Socket del host: ", hostSocket);
        console.log("DATA ", data);

        // CREAR LA LOBBY
        let lobby_exists = false;
        lobbies.forEach((element) => {
            if (element.lobbyCode == data.lobbyCode) {
                lobby_exists = true;
            }

        });

        if (!lobby_exists) {
            lobbies.push({
                lobbyCode: data.lobbyCode,
                maxUsers: data.maxUsers,
                lobbyCreator: data.hostId,
                users: [{
                    workerId: data.hostId,
                    completeName: data.completeName
                }],
            });

            lobbies.forEach((lobbie) => {
                lobbie.users.forEach((user) => {
                    console.log("ESTON SON LOS USUARIOS: ", user);
                })
            })
        }

        data.assignedWorkers.forEach(worker => {
            const workerId = worker.id; 
    
            if (workerId !== data.hostId) {
                const workerSocket = employeeSocketMap[workerId];
                console.log("Procesando workerId:", workerId);

                if (workerSocket && workerSocket.socketId) {
                    console.log(workerSocket.socketId + " EXISTE");

                    io.to(workerSocket.socketId).emit("invitationReceived", {
                        message: "Estás invitado",
                        invitation: true,
                        applicationId: data.applicationId,
                        lobbyCode: data.lobbyCode
                    });
                }
            }
        });
    });

    socket.on("acceptInvitation", (data) => {
        console.log("Revisando lobbies para el código:", data.lobbyCode);
    
        lobbies.forEach(lobby => {
            if (lobby.lobbyCode === data.lobbyCode) {
                console.log("Lobby encontrado, revisando usuarios...");
                const isUserInLobby = lobby.users.some(user => user.workerId === data.workerId);
    
                if (!isUserInLobby) {
                    console.log("Usuario no está en el lobby, verificando capacidad...");
                    if (lobby.users.length < lobby.maxUsers) {
                        lobby.users.push({
                            workerId: data.workerId,
                            completeName: data.workerName
                        });
    
                        console.log("Añadiendo usuario y enviando lista actualizada...");
                        const socketId = employeeSocketMap[lobby.lobbyCreator].socketId;
                        const socketIdUser = employeeSocketMap[data.workerId].socketId;
                        console.log("A quien le tengo que mandar el emit:", socketId);
                        console.log("A quien le tengo que mandar el emit 22:", socketIdUser);

                        
                        if (socketId) {
                            io.to(socketId).emit("newUserInLobby", {
                                users: Array.from(lobby.users)
                            });

                            console.log("USERS: ", lobby.users);
                            io.to(socketIdUser).emit("newUserInLobby", {
                                users: Array.from(lobby.users)
                            });
                        } else {
                            console.log("No se encontró el socket ID para el creador del lobby.");
                        }
    
                    } else {
                        console.log('El lobby ya está lleno. No se puede agregar más usuarios.');
                    }
                } else {
                    console.log('El usuario ya está en el lobby.');
                }
            }
        });
    });


    // Manejador de eventos para desconexión de clientes
    socket.on("disconnect", () => {
        // Buscar el ID del trabajador asociado al socket que se ha desconectado
        const disconnectedWorkerId = Object.keys(employeeSocketMap).find(key => employeeSocketMap[key].socketId === socket.id);

        // Si se encuentra el ID del trabajador desconectado, eliminarlo de employeeSocketMap
        if (disconnectedWorkerId) {
            delete employeeSocketMap[disconnectedWorkerId];
            console.log(`El trabajador con ID ${disconnectedWorkerId} se ha desconectado y se ha eliminado de employeeSocketMap.`, employeeSocketMap);
        } else {
            console.log(`No se encontró el ID del trabajador asociado al socket ${socket.id}.`);
        }
    });

    // Manejador de eventos para errores
    socket.on("error", (error) => {
        console.error("Error en el socket:", error);
    });
});


server.listen(port, host, () => {
    console.log("Listening on " + host + ": " + port);
});
