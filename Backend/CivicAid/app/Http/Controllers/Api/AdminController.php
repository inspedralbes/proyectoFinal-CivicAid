<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Mail;

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
        // $request = SigninRequest::all();
        // return $request;

        $location = $request->assignedLocation;

        $requests = SigninRequest::where('requestedLocation', $location)->where('requestStatus', 'pending')->get();

        return response()->json($requests, 200);
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
        // try {
        // DB::beginTransaction();

        $request->validate([
            'name' => 'required',
            'surname' => 'required',
            'secondSurname' => 'required',
            'sector' => 'required',
            'assignedLocation' => 'required',
            'email' => 'required|email|unique:workers',
            'password' => 'required',
        ]);

        $worker = new Worker;
        $worker->name = $request->name;
        $worker->surname = $request->surname;
        $worker->secondSurname = $request->secondSurname;
        $worker->sector = $request->sector;
        $worker->assignedLocation = $request->assignedLocation;
        $worker->email = $request->email;
        $worker->password = Hash::make($request->password);

        // Mail::to($request->email)->send(new registrationRequestAccepted($worker));

        // try {
        if ($worker->save()) {
            $message = "Registered correctly.";
            return response()->json([$message, 200, 'isRegistered' => true]);
        } else {
            $message = "Couldn't register.";
            return response()->json([$message, 500, 'isRegistered' => false]);
        }
        // } catch (QueryException $ex) {
        // }
        // } catch (\Throwable $e) {
        //     // DB::rollBack();

        //     $errorMessage = 'Error: ' . $e->getMessage();
        //     return response()->json([$errorMessage], 500);
        // }

        // DB::commit();
    }

    public function assignApplication(Request $request)
    {

        $request->validate([
            'applicationId' => 'required',
            'workerIds' => 'required|array', // workerIds debe ser un array
        ]);

        $applicationId = $request->applicationId;
        $workerIds = $request->workerIds;

        try {
            // Iterar sobre los IDs de los trabajadores y crear una asignación para cada uno
            foreach ($workerIds as $workerId) {
                $assignment = new Assignment();
                $assignment->applicationId = $applicationId;
                $assignment->workerId = $workerId;

                // Guardar la asignación
                $assignment->save();
            }

            $application = Application::findOrFail($applicationId);

            $application->applicationStatus = $request->applicationStatus;

            $application->save();

            // Si todas las asignaciones se guardaron correctamente, responder con éxito
            return response()->json(['message' => 'Asignaciones realizadas correctamente', 'success' => true], 200);
        } catch (\Exception $e) {
            // En caso de error, responder con un mensaje de error
            return response()->json(['message' => 'Error al realizar las asignaciones', 'success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function listApplicationsLocation(Request $request)
    {
        // $request = SigninRequest::all();
        // return $request;

        $location = $request->assignedLocation;

        $requests = Application::where('province', $location)->where('applicationStatus', 'pending')->get();

        return response()->json($requests, 200);
    }

    public function listWorkers(Request $request)
    {
        // $request = SigninRequest::all();
        // return $request;

        $location = $request->assignedLocation;
        // $requestedSector = $request->requestedSector;

        $requests = Worker::where('assignedLocation', $location)->get();

        return response()->json($requests, 200);
    }
}
