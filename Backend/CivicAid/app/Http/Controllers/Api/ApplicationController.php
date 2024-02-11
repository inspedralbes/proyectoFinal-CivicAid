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

    // public function listApplicationsSector($applicationSector)
    // {
    //     $applicationSector = Application::find($applicationSector);    
    //     // $application = Application::all();
    //     return $applicationSector;
    // }

    // public function listApplicationsSector(Request $request)
    // {
    //     // Aquí puedes realizar la lógica para recuperar las aplicaciones relacionadas con el sector del trabajador
    //     // Por ejemplo, asumiendo que tienes un modelo de Application que está vinculado al sector del trabajador
    //     $application->sector = $request->sector;

    //     $applications = Application::where('sector', $sector)->get();

    //     // Retornar las aplicaciones encontradas como respuesta
    //     return response()->json($applications, 200);
    // }

    public function listApplicationsSector(Request $request)
    {
        // Obtener el sector del trabajador del cuerpo de la solicitud
        $sector = $request->sector;

        // Aquí puedes realizar la lógica para recuperar las aplicaciones relacionadas con el sector del trabajador
        // Por ejemplo, asumiendo que tienes un modelo de Application que está vinculado al sector del trabajador

        $applications = Application::where('sector', $sector)->get();

        // Retornar las aplicaciones encontradas como respuesta
        return response()->json($applications, 200);
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
