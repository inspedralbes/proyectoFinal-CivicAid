<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WorkerApplication;

class WorkerApplicationController extends Controller
{
    public function updateApplicationStatus(Request $request){

        // $application = new WorkerApplication();
        // $application->applicationId = $request->applicationId;
        // $application->applicantId = $request->applicantId;
        // $application->assignedWorker = $request->assignedWorker;
        // $application->applicationStatus = $request->applicationStatus;

        // $application->save();

        // return $application;

        // try {
        //     // Buscar la solicitud que deseas actualizar
        //     $application = WorkerApplication::findOrFail($id);

        //     // Actualizar los campos
        //     $application->status = $request->status;


        //     // Guardar los cambios en la base de datos
        //     $application->save();

        //     return $application;
        // } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        //     // Manejar el caso donde la ID no existe
        //     return response()->json(['error' => 'Solicitud no encontrada'], 404);
        // } catch (\Exception $e) {
        //     // Manejar otros errores
        //     return response()->json(['error' => 'Error interno del servidor'], 500);
        // }



    }
}
