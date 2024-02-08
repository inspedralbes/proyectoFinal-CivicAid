<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;

class ApplicationController extends Controller
{

    public function listApplications()
    {
        $application = Application::all();
        return $application;
    }


    public function makeApplication(Request $request)
    {
        $application = new Application();
        $application->applicationId = $request->applicationId;
        $application->title = $request->title;
        $application->description = $request->description;
        $application->sector = $request->sector;
        $application->subsector = $request->subsector;
        $application->date = $request->date;

        $application->save();

        return $application;
    }

    public function updateApplication(Request $request, $id)
{
    try {
        // Buscar la solicitud que deseas actualizar
        $application = Application::findOrFail($id);

        // Actualizar los campos
        $application->title = $request->title;
        $application->description = $request->description;
        $application->date = $request->date;

        // Guardar los cambios en la base de datos
        $application->save();

        return $application;
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        // Manejar el caso donde la ID no existe
        return response()->json(['error' => 'Solicitud no encontrada'], 404);
    } catch (\Exception $e) {
        // Manejar otros errores
        return response()->json(['error' => 'Error interno del servidor'], 500);
    }
}

}
