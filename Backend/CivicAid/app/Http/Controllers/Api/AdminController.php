<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use OpenApi\Annotations as OA;

use App\Models\SigninRequest;
use App\Models\Worker;
use App\Mail\registrationRequestAccepted;
use App\Mail\registrationRequestDenied;
use App\Models\Application;
use App\Models\Assignment;

class AdminController extends Controller
{
    /**
     * List pending sign-in requests for a specific location.
     *
     * @OA\Get(
     *     path="/api/listRequests",
     *     summary="List pending sign-in requests",
     *     tags={"AdminController"},
     *     @OA\Parameter(
     *         name="assignedLocation",
     *         in="query",
     *         required=true,
     *         @OA\Schema(type="string"),
     *         description="The location assigned to the admin"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of pending sign-in requests",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="requestedLocation", type="string", example="Location"),
     *                 @OA\Property(property="requestStatus", type="string", example="pending"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2023-06-01T12:34:56Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2023-06-01T12:34:56Z")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Invalid location parameter")
     *         )
     *     )
     * )
     */
    public function listRequests(Request $request)
    {
        $location = $request->assignedLocation;

        $requests = SigninRequest::where('requestedLocation', $location)->where('requestStatus', 'pending')->get();

        return response()->json($requests, 200);
    }

    /**
     * List accepted sign in requests.
     *
     * @OA\Get(
     *     path="/api/listAcceptedSignInRequests",
     *     summary="List accepted sign in requests",
     *     tags={"AdminController"},
     *     @OA\Parameter(
     *         name="assignedLocation",
     *         in="query",
     *         required=true,
     *         @OA\Schema(type="string"),
     *         description="The location assigned to the admin"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of pending sign-in requests",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="dni", type="string", example="12345678S"),
     *                 @OA\Property(property="name", type="string", example="John"),
     *                 @OA\Property(property="surname", type="string", example="Doe"),
     *                 @OA\Property(property="secondSurname", type="string", example="Doe"),
     *                 @OA\Property(property="profileImage", type="blob", example="profileImage.jpg"),
     *                 @OA\Property(property="sector", type="string", example="Bomberos"), 
     *                 @OA\Property(property="requestedLocation", type="string", example="Barcelona"),
     *                 @OA\Property(property="requestStatus", type="string", example="pending"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2023-06-01T12:34:56Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2023-06-01T12:34:56Z")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Invalid location parameter")
     *         )
     *     )
     * )
     */
    public function listAcceptedSignInRequests(Request $request)
    {
        $adminId = $request->adminId;

        $acceptedRequests = Worker::where('approvedBy', $adminId)->get();

        return response()->json($acceptedRequests, 200);
    }

    /**
     * List assigned applications and their workers for a specific admin.
     *
     * @OA\Post(
     *     path="/api/listAssignedApplicationsWorkers",
     *     summary="List assigned applications and their workers",
     *     tags={"AdminController"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"adminId"},
     *             @OA\Property(property="adminId", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of assigned applications and their workers",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="applicantId", type="integer", example=1),
     *                 @OA\Property(property="title", type="string", example="Application Title"),
     *                 @OA\Property(property="description", type="string", example="Application Description"),
     *                 @OA\Property(property="profileImage", type="blob", example="profileImage.jpg"),
     *                 @OA\Property(property="sector", type="string", example="Bomberos"), 
     *                 @OA\Property(property="subsector", type="string", example="Extinción de Incendios"), 
     *                 @OA\Property(property="applicationStatus", type="string", enum={"pending", "approved", "rejected"}, example="pending"),
     *                 @OA\Property(property="province", type="string", example="Barcelona"),
     *                 @OA\Property(property="location", type="string", example="Avinguda Esplugues"),
     * 
     *                 @OA\Property(property="workers", type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="Worker Name"),
     *                         @OA\Property(property="email", type="string", example="worker@example.com")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Falta el parámetro adminId")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Error en la solicitud")
     *         )
     *     )
     * )
     */
    public function listAssignedApplicationsWorkers(Request $request)
    {
        // Verifica que adminId está presente en la solicitud
        if (!$request->has('adminId')) {
            return response()->json(['error' => 'Falta el parámetro adminId'], 400);
        }

        $adminId = $request->adminId;

        try {
            // Obtener los IDs de las aplicaciones asignadas al admin
            $assignments = Assignment::where('adminId', $adminId)->pluck('applicationId');

            // Si no hay assignments, devuelve un mensaje adecuado
            if ($assignments->isEmpty()) {
                return response()->json(['message' => 'No se encontraron solicitudes asignadas'], 200);
            }

            // Obtener las aplicaciones cuyos IDs están en la lista de assignments
            $assignedApplications = Application::whereIn('id', $assignments)->get();

            // Obtener los trabajadores asignados a estas aplicaciones
            $assignedWorkers = Worker::whereIn('id', function ($query) use ($assignments) {
                $query->select('workerId')
                    ->from('assignments')
                    ->whereIn('applicationId', $assignments);
            })->get();

            // Agrupar los trabajadores por aplicaciónId
            $workersByApplication = [];
            foreach ($assignedWorkers as $worker) {
                $assignment = Assignment::where('workerId', $worker->id)->first();
                $applicationId = $assignment->applicationId;
                if (!isset($workersByApplication[$applicationId])) {
                    $workersByApplication[$applicationId] = [];
                }
                $workersByApplication[$applicationId][] = $worker;
            }

            // Añadir los trabajadores a las aplicaciones
            foreach ($assignedApplications as $application) {
                $application->workers = $workersByApplication[$application->id] ?? [];
            }

            return response()->json($assignedApplications, 200);
        } catch (\Exception $e) {
            // Registra el error para su depuración
            Log::error('Error en listAssignedApplications:', ['error' => $e->getMessage()]);

            // Devuelve un mensaje de error controlado
            return response()->json(['error' => 'Error en la solicitud'], 500);
        }
    }


    /**
     * Update the status of a sign-in request.
     *
     * @OA\Put(
     *     path="/api/updateRequestStatus/{id}",
     *     summary="Update the status of a sign-in request",
     *     tags={"AdminController"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID of the sign-in request"
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"requestStatus"},
     *             @OA\Property(property="requestStatus", type="string", enum={"pending", "accepeted", "denied"}, example="pending")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Request status updated successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="requestedLocation", type="string", example="Location"),
     *             @OA\Property(property="requestStatus", type="string", example="approved"),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2023-06-01T12:34:56Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2023-06-01T12:34:56Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Request not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Request not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid request status")
     *         )
     *     )
     * )
     */
    public function updateRequestStatus(Request $request, $id)
    {
        $application = SigninRequest::findOrFail($id);

        $application->requestStatus = $request->requestStatus;

        $application->save();

        return response()->json($application, 200);
    }

    /**
     * Accept a sign-in request and register a new worker.
     *
     * @OA\Post(
     *     path="/api/acceptRequest",
     *     summary="Accept a sign-in request and register a new worker",
     *     tags={"AdminController"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={
     *                 "dni", "approvedBy", "name", "surname", 
     *                 "secondSurname", "profileImage", "sector", 
     *                 "assignedLocation", "assignedApplications", 
     *                 "email", "password"
     *             },
     *             @OA\Property(property="dni", type="string", example="12345678A"),
     *             @OA\Property(property="approvedBy", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="John"),
     *             @OA\Property(property="surname", type="string", example="Doe"),
     *             @OA\Property(property="secondSurname", type="string", example="Smith"),
     *             @OA\Property(property="profileImage", type="string", example="image_url"),
     *             @OA\Property(property="sector", type="string", example="IT"),
     *             @OA\Property(property="assignedLocation", type="string", example="Main Office"),
     *             @OA\Property(property="assignedApplications", type="string", example="App1,App2"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="password", type="string", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Registered correctly",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Registered correctly."),
     *             @OA\Property(property="isRegistered", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", additionalProperties={"type": "string"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Server error"),
     *             @OA\Property(property="error", type="string", example="Error message")
     *         )
     *     )
     * )
     */
    public function acceptRequest(Request $request)
    {
        try {
            // Validación de la solicitud
            $validated = $request->validate([
                'dni' => 'required',
                'approvedBy' => 'required',
                'name' => 'required',
                'surname' => 'required',
                'secondSurname' => 'required',
                'profileImage' => 'required',
                'sector' => 'required',
                'assignedLocation' => 'required',
                'assignedApplications' => 'required',
                'email' => 'required|email|unique:workers',
                'password' => 'required',
            ]);

            // Creación del trabajador
            $worker = new Worker;
            // $worker->fill($validated);
            $worker->dni = $request->dni;
            $worker->approvedBy = $request->approvedBy;
            $worker->name = $request->name;
            $worker->surname = $request->surname;
            $worker->secondSurname = $request->secondSurname;
            $worker->sector = $request->sector;
            $worker->assignedLocation = $request->assignedLocation;
            $worker->profileImage = $request->profileImage;
            $worker->assignedApplications = $request->assignedApplications;
            $worker->email = $request->email;
            $worker->password = Hash::make($request->password);

            try {
                Mail::to($request->email)->send(new registrationRequestAccepted($worker, $request->password));
            } catch (\Exception $exception) {
                // Registrar el error
                Log::error('Error al enviar el correo electrónico de solicitud de registro: ' . $exception->getMessage());

                return response()->json(['error' => 'Error al enviar el correo electrónico de solicitud de registro.'], 500);
            }

            // Intentar guardar el trabajador
            if ($worker->save()) {
                return response()->json(['message' => "Registered correctly.", 'isRegistered' => true], 200);
            } else {
                return response()->json(['message' => "Couldn't register due to an unknown error.", 'isRegistered' => false], 500);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Captura de errores de validación
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Captura de cualquier otro error
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Deny a sign-in request and send a notification email.
     *
     * @OA\Post(
     *     path="/api/denyRequest",
     *     summary="Deny a sign-in request",
     *     tags={"AdminController"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"id", "requestStatus"},
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="requestStatus", type="string", enum={"denied"}, example="denied")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Request denied successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="requestStatus", type="string", example="denied"),
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2023-06-01T12:34:56Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2023-06-01T12:34:56Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", additionalProperties={"type": "string"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Server error"),
     *             @OA\Property(property="error", type="string", example="Error message")
     *         )
     *     )
     * )
     */
    public function denyRequest(Request $request)
    {
        try {
            // Validación de la solicitud
            $validated = $request->validate([
                'id' => 'required',
                'requestStatus' => 'required',
            ]);

            $deniedRequestId = $request->id;
            $deniedRequest = SigninRequest::findOrFail($deniedRequestId);
            // $deniedRequest = SigninRequest::where('id', $deniedRequestId)->first();
            Log::error('Intentando enviar email a: ' . $deniedRequest->email);
            if ($deniedRequest) {

                // $application = SigninRequest::findOrFail($id);

                $deniedRequest->requestStatus = $request->requestStatus;

                $deniedRequest->save();

                Mail::to($deniedRequest->email)->send(new registrationRequestDenied($deniedRequest));

                return response()->json([$deniedRequest]);
            }
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Server error', 'error' => $th->getMessage()], 500);
        }
    }

    /**
     * Assign an application to workers.
     *
     * @OA\Post(
     *     path="/api/assignApplication",
     *     summary="Assign an application to workers",
     *     tags={"AdminController"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"adminId", "applicationId", "workerIds", "applicationStatus"},
     *             @OA\Property(property="adminId", type="integer", example=1),
     *             @OA\Property(property="applicationId", type="integer", example=10),
     *             @OA\Property(
     *                 property="workerIds",
     *                 type="array",
     *                 @OA\Items(type="integer", example=5)
     *             ),
     *             @OA\Property(property="applicationStatus", type="string", example="assigned")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Assignments completed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Asignaciones realizadas correctamente"),
     *             @OA\Property(property="success", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", additionalProperties={"type": "string"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error while making assignments",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Error al realizar las asignaciones"),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Error message")
     *         )
     *     )
     * )
     */

    public function assignApplication(Request $request)
    {
        $request->validate([
            'adminId' => 'required',
            'applicationId' => 'required',
            'workerIds' => 'required|array',
            'applicationStatus' => 'required',
        ]);

        $adminId = $request->adminId;
        $applicationId = $request->applicationId;
        $workerIds = $request->workerIds;

        try {
            foreach ($workerIds as $workerId) {
                $assignment = new Assignment();
                $assignment->adminId = $adminId;
                $assignment->applicationId = $applicationId;
                $assignment->workerId = $workerId;
                $assignment->save();
            }
            Worker::whereIn('id', $workerIds)->increment('assignedApplications');

            $application = Application::findOrFail($applicationId);
            $application->applicationStatus = $request->applicationStatus;
            $application->save();

            return response()->json(['message' => 'Asignaciones realizadas correctamente', 'success' => true], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Error al realizar las asignaciones: ' . $e->getMessage(), 'success' => false], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al realizar las asignaciones', 'success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * List pending applications for a specific location.
     *
     * @OA\Post(
     *     path="/api/listApplicationsLocation",
     *     summary="List pending applications for a specific location",
     *     tags={"AdminController"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"assignedLocation"},
     *             @OA\Property(property="assignedLocation", type="string", example="Barcelona")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of pending applications",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Example Application"),
     *                 @OA\Property(property="province", type="string", example="Barcelona"),
     *                 @OA\Property(property="applicationStatus", type="string", example="pending"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2023-06-01T12:34:56Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2023-06-01T12:34:56Z")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", additionalProperties={"type": "string"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Server error"),
     *             @OA\Property(property="error", type="string", example="Error message")
     *         )
     *     )
     * )
     */
    public function listApplicationsLocation(Request $request)
    {
        $location = $request->assignedLocation;

        $requests = Application::where('province', $location)->where('applicationStatus', 'pending')->get();

        return response()->json($requests, 200);
    }


    /**
     * List workers assigned to a specific location.
     *
     * @OA\Get(
     *     path="/api/listWorkers",
     *     summary="List all workers assigned to a specified location",
     *     tags={"AdminController"},
     *     @OA\Parameter(
     *         name="assignedLocation",
     *         in="query",
     *         required=true,
     *         description="Location to filter workers by",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of workers",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="assignedLocation", type="string", example="Madrid"),
     *                 @OA\Property(property="email", type="string", example="johndoe@example.com"),
     *                 @OA\Property(property="position", type="string", example="Engineer"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2023-06-01T12:34:56Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2023-06-01T12:34:56Z")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No workers found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="No workers found for the specified location.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="An unexpected error occurred."),
     *             @OA\Property(property="error", type="string", example="Error message detailing what went wrong")
     *         )
     *     )
     * )
     */
    public function listWorkers(Request $request)
    {
        $request->validate([
            'assignedLocation' => 'required|string',
        ]);

        $location = $request->assignedLocation;
        $workers = Worker::where('assignedLocation', $location)->get();

        if ($workers->isEmpty()) {
            return response()->json(['message' => 'No workers found for the specified location.'], 404);
        }

        return response()->json($workers, 200);
    }
}
