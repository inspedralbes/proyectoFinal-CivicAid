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
            'id' => 'required',
            'name' => 'required',
            'surname' => 'required',
            'secondSurname' => 'required',
            'sector' => 'required',
            'assignedLocation' => 'required',
            'assignedApplications' => 'required',
            'email' => 'required|email|unique:workers',
            'password' => 'required',
        ]);

        $worker = new Worker;
        $worker->id = $request->id;
        $worker->name = $request->name;
        $worker->surname = $request->surname;
        $worker->secondSurname = $request->secondSurname;
        $worker->sector = $request->sector;
        $worker->assignedLocation = $request->assignedLocation;
        $worker->assignedApplications = $request->assignedApplications;
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
            'workerIds' => 'required|array',
            'applicationStatus' => 'required',
        ]);

        $applicationId = $request->applicationId;
        $workerIds = $request->workerIds;

        try {
            foreach ($workerIds as $workerId) {
                $assignment = new Assignment();
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