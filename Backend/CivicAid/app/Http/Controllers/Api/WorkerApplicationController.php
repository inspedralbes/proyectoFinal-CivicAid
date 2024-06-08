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
    /**
     * Retrieve applications assigned to a worker.
     *
     * This endpoint retrieves and returns a list of applications assigned to a specific worker based on the provided worker ID.
     *
     * @OA\Get(
     *     path="/api/listAssignedApplications",
     *     operationId="listAssignedApplications",
     *     tags={"WorkerApplicationController"},
     *     summary="List assigned applications by worker ID",
     *     description="Retrieves a list of applications assigned to a specific worker based on the provided worker ID.",
     *     @OA\Parameter(
     *         name="workerId",
     *         in="query",
     *         required=true,
     *         description="ID of the worker to retrieve assigned applications for",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="applicantId", type="integer", example=123),
     *                 @OA\Property(property="title", type="string", example="New Community Center"),
     *                 @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *                 @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *                 @OA\Property(property="sector", type="string", example="Public"),
     *                 @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *                 @OA\Property(property="applicationStatus", type="string", example="pending"),
     *                 @OA\Property(property="province", type="string", example="Madrid"),
     *                 @OA\Property(property="location", type="string", example="Central Madrid"),
     *                 @OA\Property(property="date", type="string", format="date", example="2024-07-10"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-07-10T14:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-07-10T14:00:00Z")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error in the request"
     *     )
     * )
     */
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



    /**
     * Retrieve applications assigned to multiple workers.
     *
     * @OA\Get(
     *     path="/api/listApplicationMultipleWorkers",
     *     operationId="listApplicationMultipleWorkers",
     *     tags={"AssignmentController"},
     *     summary="List applications assigned to multiple workers",
     *     description="Retrieves a list of applications that are assigned to multiple workers based on the provided worker ID.",
     *     @OA\Parameter(
     *         name="workerId",
     *         in="query",
     *         required=true,
     *         description="ID of the worker to check for multiple worker assignments",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="applications",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="applicantId", type="integer", example=123),
     *                     @OA\Property(property="title", type="string", example="New Community Center"),
     *                     @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *                     @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *                     @OA\Property(property="sector", type="string", example="Public"),
     *                     @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *                     @OA\Property(property="applicationStatus", type="string", example="pending"),
     *                     @OA\Property(property="province", type="string", example="Madrid"),
     *                     @OA\Property(property="location", type="string", example="Central Madrid"),
     *                     @OA\Property(property="date", type="string", format="date", example="2024-07-10"),
     *                     @OA\Property(property="created_at", type="string", format="date-time", example="2024-07-10T14:00:00Z"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time", example="2024-07-10T14:00:00Z")
     *                 )
     *             ),
     *             @OA\Property(
     *                 property="workers",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="John"),
     *                     @OA\Property(property="surname", type="string", example="Doe"),
     *                     @OA\Property(property="secondSurname", type="string", example="Smith"),
     *                     @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *                     @OA\Property(property="profileImage", type="string", example="http://example.com/storage/images/profile.jpg"),
     *                     @OA\Property(property="assignedLocation", type="string", example="Madrid"),
     *                     @OA\Property(property="assignedApplications", type="integer", example=3)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error in the request"
     *     )
     * )
     */
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


    /**
     * Retrieve inactive applications assigned to multiple workers and their associated workers.
     *
     * @OA\Get(
     *     path="/api/listWorkersExactApplication",
     *     operationId="listWorkersExactApplication",
     *     tags={"AssignmentController"},
     *     summary="List inactive applications assigned to multiple workers and their workers",
     *     description="Retrieves a list of inactive applications assigned to multiple workers and their associated workers and applications.",
     *     @OA\Parameter(
     *         name="workerId",
     *         in="query",
     *         required=true,
     *         description="ID of the worker to check for multiple worker assignments",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="applications",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="applicantId", type="integer", example=123),
     *                     @OA\Property(property="title", type="string", example="New Community Center"),
     *                     @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *                     @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *                     @OA\Property(property="sector", type="string", example="Public"),
     *                     @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *                     @OA\Property(property="applicationStatus", type="string", example="inactive"),
     *                     @OA\Property(property="province", type="string", example="Madrid"),
     *                     @OA\Property(property="location", type="string", example="Central Madrid"),
     *                     @OA\Property(property="date", type="string", format="date", example="2024-07-10"),
     *                     @OA\Property(
     *                         property="workers",
     *                         type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="name", type="string", example="John"),
     *                             @OA\Property(property="surname", type="string", example="Doe")
     *                         )
     *                     )
     *                 )
     *             ),
     *             @OA\Property(
     *                 property="workers",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="John"),
     *                     @OA\Property(property="surname", type="string", example="Doe"),
     *                     @OA\Property(
     *                         property="applications",
     *                         type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="title", type="string", example="New Community Center"),
     *                             @OA\Property(property="applicationStatus", type="string", example="inactive")
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error in the request"
     *     )
     * )
     */
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
                    $query->select('workers.id', 'name', 'surname');
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


    /**
     * Check ongoing application status.
     *
     * This endpoint retrieves an application by its ID, excluding those with a 'completed' status.
     *
     * @OA\Get(
     *     path="/api/checkOngoingApp",
     *     operationId="checkOngoingApp",
     *     tags={"WorkerApplicationController"},
     *     summary="Check ongoing application",
     *     description="Retrieves an application by its ID, excluding those with a 'completed' status.",
     *     @OA\Parameter(
     *         name="applicationId",
     *         in="query",
     *         required=true,
     *         description="ID of the application to check",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="applicantId", type="integer", example=123),
     *             @OA\Property(property="title", type="string", example="New Community Center"),
     *             @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *             @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *             @OA\Property(property="sector", type="string", example="Public"),
     *             @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *             @OA\Property(property="applicationStatus", type="string", example="pending"),
     *             @OA\Property(property="province", type="string", example="Madrid"),
     *             @OA\Property(property="location", type="string", example="Central Madrid"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-07-10")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Application not found"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     */
    public function checkOngoingApp(Request $request)
    {
        $validated = $request->validate([
            'applicationId' => 'required',
        ]);

        $applicationId = $validated['applicationId'];

        $application = Application::where('id', $applicationId)->where('applicationStatus', '!=', 'completed')->get();

        return response()->json($application, 200);
    }


    /**
     * Update the status of an application and the worker(s) associated with it.
     *
     * @OA\Put(
     *     path="/api/updateApplicationStatus/{id}",
     *     operationId="updateApplicationStatus",
     *     tags={"WorkerApplicationController"},
     *     summary="Update application status",
     *     description="Updates the status of a specific application and the status of associated worker(s).",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the application to update",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="applicationStatus", type="string", example="completed"),
     *             @OA\Property(property="workerId", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="applicantId", type="integer", example=123),
     *             @OA\Property(property="title", type="string", example="New Community Center"),
     *             @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *             @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *             @OA\Property(property="sector", type="string", example="Public"),
     *             @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *             @OA\Property(property="applicationStatus", type="string", example="completed"),
     *             @OA\Property(property="province", type="string", example="Madrid"),
     *             @OA\Property(property="location", type="string", example="Central Madrid"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-07-10"),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-06-01T12:34:56Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-06-02T12:34:56Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Application not found"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     */
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


    /**
     * Mark an application as completed and update the worker's status.
     *
     * @OA\Post(
     *     path="/api/applicationCompleted",
     *     operationId="applicationCompleted",
     *     tags={"WorkerApplicationController"},
     *     summary="Mark application as completed",
     *     description="Marks an application as completed, records the explanation, and updates the worker's status to available.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="applicationId", type="integer", example=1),
     *             @OA\Property(property="workerId", type="integer", example=2),
     *             @OA\Property(property="applicationExplanation", type="string", example="The project was successfully completed.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Application marked as completed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="applicationId", type="integer", example=1),
     *             @OA\Property(property="workerId", type="integer", example=2),
     *             @OA\Property(property="applicationExplanation", type="string", example="The project was successfully completed."),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-06-10T12:34:56Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-06-10T12:34:56Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     */

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

            Application::where('id', $request->applicationId)->update(['applicationStatus' => 'completed']);
            Worker::where('id', $request->workerId)->update(['workerStatus' => 'available']);

            return response($applicationCompleted);
        } catch (\Exception $e) {
            return response('SUPER ERROR: ' + $e);
        }
    }


    /**
     * Mark an application as completed and update the status of multiple workers.
     *
     * @OA\Post(
     *     path="/api/applicationNodeCompleted",
     *     operationId="applicationNodeCompleted",
     *     tags={"WorkerApplicationController"},
     *     summary="Mark application as completed and update workers",
     *     description="Marks an application as completed, records the explanation, and updates the status of multiple workers to available.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="applicationId", type="integer", example=1),
     *             @OA\Property(property="workerId", type="array", @OA\Items(type="integer"), example={2, 3}),
     *             @OA\Property(property="applicationExplanation", type="string", example="The project was successfully completed.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Application and workers updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="applicationId", type="integer", example=1),
     *             @OA\Property(property="workerId", type="integer", example=2),
     *             @OA\Property(property="applicationExplanation", type="string", example="The project was successfully completed."),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-06-10T12:34:56Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-06-10T12:34:56Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     */
    public function applicationNodeCompleted(Request $request)
    {
        try {
            $validated = $request->validate([
                'applicationId' => 'required',
                'workerId' => 'required|array',
                'applicationExplanation' => 'required',
            ]);

            foreach ($request->workerId as $workerId) {
                $applicationCompleted = new CompletedApplication();
                $applicationCompleted->applicationId = $request->applicationId;
                $applicationCompleted->workerId = $workerId;
                $applicationCompleted->applicationExplanation = $request->applicationExplanation;
                $applicationCompleted->save();

                // Actualizar el estado del worker
                Worker::where('id', $workerId)->update(['workerStatus' => 'available']);
            }

            // Actualizar el estado de la aplicación
            Application::where('id', $request->applicationId)->update(['applicationStatus' => 'completed']);

            return response($applicationCompleted);
        } catch (\Exception $e) {
            return response('SUPER ERROR: ' + $e);
        }
    }
}
