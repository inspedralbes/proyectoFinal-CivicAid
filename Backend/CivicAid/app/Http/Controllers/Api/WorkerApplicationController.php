<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\Assignment;
use App\Models\Worker;

class WorkerApplicationController extends Controller
{
    public function listAssignedApplications(Request $request)
    {
        $validated = $request->validate([
            'workerId' => 'required',
        ]);
    
        $workerId = $validated['workerId'];
    
        // Primero, obtén todos los IDs de las aplicaciones asignadas al trabajador
        $applicationIds = Assignment::where('workerId', $workerId)->pluck('applicationId');
    
        // Luego, utiliza esos IDs para obtener las aplicaciones asignadas
        $assignedApplications = Application::whereIn('id', $applicationIds)->where('applicationStatus', '!=', 'completed')->get();
    
        return response()->json($assignedApplications, 200);
    }

    public function checkOngoingApp(Request $request)
    {
        $validated = $request->validate([
            'applicationId' => 'required',
        ]);

        $applicationId = $validated['applicationId'];

        $application = Application::where('id', $applicationId)->where('applicationStatus', '!=', 'completed')->get();

        return response()->json($application, 200);

    }

    public function updateApplicationStatus(Request $request, $id)
    {
        try {
            $application = Application::findOrFail($id);
            $application->applicationStatus = $request->applicationStatus;
            $application->save();

            $workerId = $request->workerId;
            Worker::where('id', $workerId)->update(['workerStatus' => 'inService']);
            

            return response()->json($application, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Manejar el caso donde la ID no existe
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        } catch (\Exception $e) {
            // Manejar otros errores
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
