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

    lobbies.forEach(lobbie => {
        console.log(lobbie);
    })
    // console.log("\n"+lobbies);
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

    socket.on("cancelInvitation", (data) => {
        const usersList = data.usersList;
        const hostId = data.hostId;
        const applicationId = data.applicationId;
        console.log(data);

        usersList.forEach(user => {
            const employeeSocketInfo = employeeSocketMap[user.id];

            if (employeeSocketInfo && employeeSocketInfo.socketId && user.id !== hostId) {
                // La información del socket existe y tiene un socketId, y el usuario no es el anfitrión
                console.log(employeeSocketInfo);
                io.to(employeeSocketInfo.socketId).emit("invitationCanceled", {
                    message: "Invitación cancelada",
                    applicationId,
                });
            } else {
                // La información del socket no existe, no tiene socketId, o es el anfitrión
                console.log(user.id + " No existe en el socketMap, no tiene socketId o es el anfitrión");
            }
        });
    })

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
                        // let startApplication = false;

                        // if (lobby.maxUsers === lobby.users.length) {
                        //     startApplication = true;
                        // }

                        if (socketId) {
                            // lobby.users.forEach(user => {
                            //     if (user.workerId != data.workerId) {
                            //         io.to(employeeSocketMap[user.workerId].socketId).emit("newUserInLobby", {
                            //             users: Array.from(lobby.users),
                            //             startApplication: true,
                            //         })
                            //     }
                            // })

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

                            // io.to(socketIdUser).emit("newUserInLobby", {
                            //     users: lobby.users,
                            //     startApplication: false,
                            // });

                            console.log("USUARIOS DEL LOBBY: ", lobby.users);
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

    socket.on("startApplication", async (data) => {
        // const workerIds = data.usersList;
        // console.log("SEGURO??", data);
        const workerId = data.usersList.map(user => user.workerId);
        const actualApplicationId = data.actualApplication.id;
        const actualApplication = data.actualApplication;
        // const actualLobbyCode = data.actualLobbyCode;
        const token = data.token;

        console.log("DATA DEL START: ", workerId);
        console.log("DATA DEL START: ", actualApplicationId);

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

            console.log("RETURN DEL FETCH: ", data);

            workerId.forEach(empleado => {
                io.to(employeeSocketMap[empleado].socketId).emit("returnAppOngoing", {
                    actualApplication: actualApplication,
                })
            })

            // lobbies.forEach(lobby => {
            //     if (lobby.lobbyCode === actualLobbyCode) {
            //         lobby.remove();
            //     }else{
            //         console.log("No se ha podido eliminar la lobby");
            //     }
            // })

        } catch (error) {
            console.error("ESTE ES EL ERROR: ", error);
        }
    })


    socket.on('updateText', (data) => {
        // console.log('Texto recibido:', data.newText);
        // console.log('Texto recibido:', data.users);
        console.log('Texto recibido:', data);

        try {
            // requestCurrentText(data);
            data.users.forEach(user => {
                const id = user.id;
                console.log(employeeSocketMap);
                console.log(employeeSocketMap[user.id].socketId);
                if (employeeSocketMap[id].socketId && data.writer != user.id) {
                    socket.to(employeeSocketMap[id].socketId).emit('textUpdate', data.newText);

                } else {
                    console.log("ESTE NO EXISTE COMPADRE");
                }
            })
        } catch (error) {
            console.log("error en updatetext", error);
        }
        // Emitir el texto a todos los usuarios excepto al que lo envió
    });

    // socket.on('requestCurrentText', (workerId) => {
    //     // Suponiendo que guardas el último texto conocido en alguna variable
    //     socket.to(employeeSocketMap[workerId].socketId).emit('textUpdate', currentText); // Emite el te
    //     console.log("CURRENT TEXT: ", currentText);
    // });

    // function requestCurrentText(currentText) {
    //     // currentText = ...currentText
    //     return currentText;

    // }

    socket.on('applicationNodeCompleted', async (data) => {
        console.log("PARA COMPLETAR: ", data);
        const users = data.workerId;
        const token = data.token;
        const applicationId = data.applicationId;
        const workerId = data.workerId.map(worker => worker.id);
        const applicationExplanation = data.applicationExplanation;

        console.log("LAS ID: ", workerId);

        try {
            const response = await fetch(`${laravelUrl}/api/applicationNodeCompleted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationId: applicationId, workerId: workerId, applicationExplanation: applicationExplanation }),
            });

            // data = await response.json();
            // console.log("DATATATATATATATA", data);
            const data = await response.json();
            console.log("FETCH NODE COMPLETED: ", data);
        } catch (error) {
            console.log("ERROR EN applicationNodeCompleted ", error);
        }


        users.forEach(user => {

            console.log("JAJA", user.id);

            if (employeeSocketMap[user.id].socketId) {
                io.to(employeeSocketMap[user.id].socketId).emit("applicationNodeCompletedConfirmation", {
                    completed: true
                })
            }
        })
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
