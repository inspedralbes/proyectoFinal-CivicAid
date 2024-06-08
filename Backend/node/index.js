import express, { application } from "express";
import { Server } from "socket.io";
import http from "http";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import { start } from "repl";
import { AsyncResource } from "async_hooks";
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
    console.log("Nuevo cliente conectado: ", socket.id, employeeSocketMap);

    /**
     * Socket para "asociar" el ID del empleado con el ID del socket
     */
    socket.on("register", (employeeId) => {
        employeeSocketMap[employeeId] = { socketId: socket.id };

    });

    /**
     * SOCKET PARA PEDIR LAS SOLICITUDES COMPARTIDAS A LARAVEL
     */
    socket.on('fetchMultipleAssigned', async (data) => {
        const { isWorker, token, workerId } = data;
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

        try {
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
            }

            data.assignedWorkers.forEach(worker => {
                const workerId = worker.id;

                if (workerId !== data.hostId) {
                    const workerSocket = employeeSocketMap[workerId];
                    console.log("Procesando workerId:", workerId);

                    if (workerSocket && workerSocket.socketId) {

                        io.to(workerSocket.socketId).emit("invitationReceived", {
                            message: "Estás invitado",
                            invitation: true,
                            applicationId: data.applicationId,
                            lobbyCode: data.lobbyCode
                        });
                    }
                }
            });
        } catch (error) {
            console.log("Ha habido un error en sendInvitation", error);
        }
    });

    /**
     * SOCKET PARA CANCELAR LA INVITACIÓN ENVIADA
     */
    socket.on("cancelInvitation", (data) => {
        const usersList = data.usersList;
        const hostId = data.hostId;
        const applicationId = data.applicationId;

        try {
            usersList.forEach(user => {
                const employeeSocketInfo = employeeSocketMap[user.id];

                if (employeeSocketInfo && employeeSocketInfo.socketId && user.id !== hostId) {
                    io.to(employeeSocketInfo.socketId).emit("invitationCanceled", {
                        message: "Invitación cancelada",
                        applicationId,
                    });
                } else {
                    console.log(user.id + " No existe en el socketMap, no tiene socketId o es el anfitrión");
                }
            });

        } catch (error) {
            console.log("Ha habido un error en cancelInvitation", error);
        }
    })

    /**
     * SOCKET PARA ACEPTAR LA INVITACIÓN
     */
    socket.on("acceptInvitation", (data) => {
        try {
            console.log("Revisando lobbies para el código:", data.lobbyCode);

            lobbies.forEach(lobby => {
                if (lobby.lobbyCode === data.lobbyCode) {
                    const isUserInLobby = lobby.users.some(user => user.workerId === data.workerId);

                    if (!isUserInLobby) {
                        if (lobby.users.length < lobby.maxUsers) {
                            lobby.users.push({
                                workerId: data.workerId,
                                completeName: data.workerName
                            });

                            const socketId = employeeSocketMap[lobby.lobbyCreator].socketId;
                            const socketIdUser = employeeSocketMap[data.workerId].socketId;

                            if (socketId) {
                                io.to(socketId).emit("newUserInLobby", {
                                    users: Array.from(lobby.users),
                                    startApplication: true,
                                });

                                lobby.users.forEach(user => {
                                    if (user.workerId != lobby.lobbyCreator) {
                                        io.to(employeeSocketMap[user.workerId].socketId).emit("newUserInLobby", {
                                            users: Array.from(lobby.users),
                                            startApplication: false,
                                        })
                                    }
                                })

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
        } catch (error) {
            console.log("Ha habido un error en acceptInvitation", error);
        }
    });

    /**
     * SOCKET PARA PONER EN MARCHA LA SOLICITUD
     */
    socket.on("startApplication", async (data) => {
        const workerId = data.usersList.map(user => user.workerId);
        const actualApplicationId = data.actualApplication.id;
        const actualApplication = data.actualApplication;
        const token = data.token;

        try {
            let applicationStatus = "active";

            const response = await fetch(`${laravelUrl}/api/updateApplicationStatus/${actualApplicationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationStatus, workerId }),
            });

            const data = await response.json();

            workerId.forEach(empleado => {
                io.to(employeeSocketMap[empleado].socketId).emit("returnAppOngoing", {
                    actualApplication: actualApplication,
                })
            })

        } catch (error) {
            console.error("Ha habido un error en startApplication ", error);
        }
    })

    /**
     * SOCKET PARA QUE EL TEXTO DE LA SOLICITUD EN MARCHA SE ACTUALIZE PARA TODOS LOS USUARIOS
     */
    socket.on('updateText', (data) => {
        try {
            data.users.forEach(user => {
                const id = user.id;

                if (employeeSocketMap[id].socketId && data.writer != user.id) {
                    socket.to(employeeSocketMap[id].socketId).emit('textUpdate', data.newText);

                } else {
                    console.log("NO EXISTE ESTE USUARIO");
                }
            })
        } catch (error) {
            console.log("Ha habido un error en updateText", error);
        }
    });


    socket.on('applicationNodeCompleted', async (data) => {
        const users = data.workerId;
        const token = data.token;
        const applicationId = data.applicationId;
        const workerId = data.workerId.map(worker => worker.id);
        const applicationExplanation = data.applicationExplanation;


        try {
            const response = await fetch(`${laravelUrl}/api/applicationNodeCompleted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationId: applicationId, workerId: workerId, applicationExplanation: applicationExplanation }),
            });

            const data = await response.json();
            
            users.forEach(user => {
                if (employeeSocketMap[user.id].socketId) {
                    io.to(employeeSocketMap[user.id].socketId).emit("applicationNodeCompletedConfirmation", {
                        completed: true
                    })
                }
            })

            
        } catch (error) {
            console.log("Ha habido un error en applicationNodeCompleted ", error);
        }


    })

    // Manejador de eventos para desconexión de clientes
    socket.on("disconnect", () => {
        // Buscar el ID del trabajador asociado al socket que se ha desconectado
        const disconnectedWorkerId = Object.keys(employeeSocketMap).find(key => employeeSocketMap[key].socketId === socket.id);

        // Si se encuentra el ID del trabajador desconectado, eliminarlo de employeeSocketMap
        if (disconnectedWorkerId) {
            // delete employeeSocketMap[disconnectedWorkerId];
            console.log(`El trabajador con ID ${disconnectedWorkerId} se ha desconectado.`, employeeSocketMap);
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
