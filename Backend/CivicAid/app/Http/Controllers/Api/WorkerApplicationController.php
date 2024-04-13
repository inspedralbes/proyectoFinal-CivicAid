<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\Assignment;
use App\Models\Worker;
use App\Models\CompletedApplication;

class WorkerApplicationController extends Controller
{
    public function listAssignedApplications(Request $request)
    {

        try {
            $validated = $request->validate([
                'workerId' => 'required',
            ]);

            $workerId = $validated['workerId'];

            // Consulta para obtener los ids de las aplicaciones asignadas al trabajador
            $applicationId = Assignment::where('workerId', $workerId)->pluck('applicationId');

            // Consulta para obtener las asignaciones agrupadas por applicationId
            $assignments = Assignment::whereIn('applicationId', $applicationId)
                ->select('applicationId')
                ->groupBy('applicationId')
                ->havingRaw('COUNT(DISTINCT workerId) = 1') // Filtrar grupos con más de un workerId
                ->pluck('applicationId');

            // Consulta para obtener las solicitudes asociadas a las asignaciones encontradas
            $applications = Application::whereIn('id', $assignments)->get();

            return response()->json($applications, 200);
        } catch (\Throwable $th) {
            return response()->json(['error' => 'Error en la solicitud'], 500);
        }
    }

    public function listApplicationMultipleWorkers(Request $request)
    {
        try {
            $validated = $request->validate([
                'workerId' => 'required',
            ]);

            $workerId = $request->workerId;

            // Obtener todas las asignaciones para las aplicaciones asociadas al trabajador
            $assignments = Assignment::where('workerId', $workerId)->pluck('applicationId');

            // Obtener las aplicaciones que están asignadas a más de un empleado
            $multipleWorkerApps = Assignment::whereIn('applicationId', $assignments)
                ->select('applicationId')
                ->groupBy('applicationId')
                ->havingRaw('COUNT(DISTINCT workerId) > 1')
                ->pluck('applicationId');

            // Obtener las aplicaciones y los trabajadores asociados
            $applications = Application::whereIn('id', $multipleWorkerApps)->get();
            
            $workers = Worker::whereIn('id', function ($query) use ($multipleWorkerApps) {
                $query->select('workerId')
                    ->from('assignments')
                    ->whereIn('applicationId', $multipleWorkerApps);
            })->get();

            return response()->json(['applications' => $applications, 'workers' => $workers], 200);
        } catch (\Throwable $th) {
            return response()->json(['error' => 'Error en la solicitud'], 500);
        }
    }

    public function listWorkersExactApplication(Request $request)
    {
        try {
            $validated = $request->validate([
                'workerId' => 'required',
            ]);

            $workerId = $request->workerId;

            // Obtener todas las asignaciones para las aplicaciones asociadas al trabajador
            $assignments = Assignment::where('workerId', $workerId)->pluck('applicationId');

            // Obtener las aplicaciones que están asignadas a más de un empleado
            $multipleWorkerApps = Assignment::whereIn('applicationId', $assignments)
                ->select('applicationId')
                ->groupBy('applicationId')
                ->havingRaw('COUNT(DISTINCT workerId) > 1')
                ->pluck('applicationId');

            // Obtener las solicitudes y los empleados asigandos a esta
            $applications = Application::whereIn('id', $multipleWorkerApps)
                ->where('applicationStatus', 'inactive') 
                ->with(['workers' => function ($query) {
                    $query->select('workers.id', 'name'); // Asegúrate de ajustar los campos seleccionados según tu modelo y necesidades
                }])
                ->get();

            // Obetener los empleados y las solicitudes que tienen asignadas estos
            $workers = Worker::whereIn('id', function ($query) use ($multipleWorkerApps) {
                $query->select('workerId')
                    ->from('assignments')
                    ->whereIn('applicationId', $multipleWorkerApps);
            })->with(['applications' => function ($query) use ($multipleWorkerApps) {
                $query->whereIn('applications.id', $multipleWorkerApps);
            }])->get();            

            return response()->json(['applications' => $applications, 'workers' => $workers], 200);
        } catch (\Throwable $th) {
            return response()->json(['error' => 'Error en la solicitud'], 500);
        }
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
            if (is_array($request->workerId)) {
                // Si $request->workerId es un array, iteramos sobre él con foreach
                foreach ($request->workerId as $id) {
                    Worker::where('id', $id)->update(['workerStatus' => 'inService']);   
                }
            } else {
                // Si $request->workerId no es un array, realizamos el update directamente
                Worker::where('id', $request->workerId)->update(['workerStatus' => 'inService']);   
            }


            return response()->json($application, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Manejar el caso donde la ID no existe
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        } catch (\Exception $e) {
            // Manejar otros errores
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function applicationCompleted(Request $request)
    {
        try {
            $validated = $request->validate([
                'applicationId' => 'required',
                'workerId' => 'required',
                'applicationExplanation' => 'required',
            ]);

            $applicationCompleted = new CompletedApplication();
            $applicationCompleted->applicationId = $request->applicationId;
            $applicationCompleted->workerId = $request->workerId;
            $applicationCompleted->applicationExplanation = $request->applicationExplanation;
            $applicationCompleted->save();
            // $updateStatus = $request->applicationStatus;
            Application::where('id', $request->applicationId)->update(['applicationStatus' => 'completed']);
            Worker::where('id', $request->workerId)->update(['workerStatus' => 'available']);

            return response($applicationCompleted);
        } catch (\Exception $e) {
            return response('SUPER ERROR: ' + $e);
        }
    }
}
