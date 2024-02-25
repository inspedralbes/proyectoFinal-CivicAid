<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;

class ApplicationController extends Controller
{

    public function makeApplication(Request $request)
    {
        $application = new Application();
        $application->id = $request->id;
        $application->applicantId = $request->applicantId;
        $application->title = $request->title;
        $application->description = $request->description;
        $application->sector = $request->sector;
        $application->subsector = $request->subsector;
        $application->date = $request->date;

        $application->save();

        return $application;
    }
    public function listApplications()
    {
        $application = Application::all();
        return $application;
    }

    public function listApplicationsSector(Request $request)
    {
        $sector = $request->sector;

        $applications = Application::where('sector', $sector)->get();

        return response()->json($applications, 200);
    }

    public function listOwnApplications(Request $request)
    {
        $id = $request->userId;

        $applications = Application::where('id', $id)->get();

        return response()->json($applications, 200);
    }


    public function updateApplication(Request $request, $id)
    {
        try {
            $application = Application::findOrFail($id);

            $application->title = $request->title;
            $application->description = $request->description;
            $application->date = $request->date;

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

    public function updateApplicationStatus(Request $request, $id)
    {
        try {
            $application = Application::findOrFail($id);

            $application->applicationStatus = $request->applicationStatus;

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
