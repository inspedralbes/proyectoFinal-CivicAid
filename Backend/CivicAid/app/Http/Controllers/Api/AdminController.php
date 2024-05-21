<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

use App\Models\SigninRequest;
use App\Models\Worker;
use App\Mail\registrationRequestAccepted;
use App\Mail\registrationRequestDenied;
use App\Models\Application;
use App\Models\Assignment;

class AdminController extends Controller
{
    public function listRequests(Request $request)
    {
        $location = $request->assignedLocation;

        $requests = SigninRequest::where('requestedLocation', $location)->where('requestStatus', 'pending')->get();

        return response()->json($requests, 200);
    }

    public function listAcceptedSignInRequests(Request $request)
    {
        $adminId = $request->adminId;

        $acceptedRequests = Worker::where('approvedBy', $adminId)->get();

        return response()->json($acceptedRequests, 200);
    }

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
            return response()->json(['message' => 'No se encontraron aplicaciones asignadas'], 200);
        }

        // Obtener las aplicaciones cuyos IDs están en la lista de assignments
        $assignedApplications = Application::whereIn('id', $assignments)->get();

        // Obtener los trabajadores asignados a estas aplicaciones
        $assignedWorkers = Worker::whereIn('id', function($query) use ($assignments) {
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


    public function updateRequestStatus(Request $request, $id)
    {
        $application = SigninRequest::findOrFail($id);

        $application->requestStatus = $request->requestStatus;

        $application->save();

        return response()->json($application, 200);
    }

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

            // $profileImagePath = $request->file('profileImage')->store('images', 'public');

            // Construye la URL del archivo concatenando el path de almacenamiento con el nombre del archivo
            // $baseUrl = config('app.url');
            // $port = ':8000'; // Define el puerto aquí

            // $imageUrl = $baseUrl . $port . '/storage/' . $profileImagePath;

            // // Almacena la URL en la base de datos
            // $worker->profileImage = $imageUrl;

            // Intentar guardar el trabajador
            if ($worker->save()) {
                // Envío de correo opcional, descomentar si es necesario
                // Mail::to($request->email)->send(new RegistrationRequestAccepted($worker));

                return response()->json([
                    'message' => "Registered correctly.",
                    'isRegistered' => true
                ], 200);
            } else {
                // Este bloque posiblemente nunca se ejecute, ya que un fallo en save() generalmente lanza una excepción
                return response()->json([
                    'message' => "Couldn't register due to an unknown error.",
                    'isRegistered' => false
                ], 500);
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

    public function listApplicationsLocation(Request $request)
    {
        $location = $request->assignedLocation;

        $requests = Application::where('province', $location)->where('applicationStatus', 'pending')->get();

        return response()->json($requests, 200);
    }

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
