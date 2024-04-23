<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{

    public function makeApplication(Request $request)
    {
        $request->validate([
            // 'id' => 'required',
            'applicantId' => 'required',
            'title' => 'required',
            'description' => 'required',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Permitir solo ciertas extensiones de archivo
            'sector' => 'required',
            'subsector' => 'required',
            'province' => 'required',
            'location' => 'required',
            'date' => 'required',
        ]);

        try {
            $application = new Application();
            // $application->id = $request->id;
            $application->applicantId = $request->applicantId;
            $application->title = $request->title;
            $application->description = $request->description;
            // $application->image = $request->image;
            $application->sector = $request->sector;
            $application->subsector = $request->subsector;
            $application->province = $request->province;
            $application->location = $request->location;
            $application->date = $request->date;

            // Obtiene el path del archivo almacenado
            $imagePath = $request->file('image')->store('images', 'public');

            // Construye la URL del archivo concatenando el path de almacenamiento con el nombre del archivo
            $baseUrl = config('app.url');
            $port = ':8000'; // Define el puerto aquí

            $imageUrl = $baseUrl . $port . '/storage/' . $imagePath;

            // Almacena la URL en la base de datos
            $application->image = $imageUrl;

            $application->save();

            // Sube el archivo al almacenamiento
            // $imagePath = $request->file('image')->store('images');

            // // Genera la URL de la imagen
            // $imageUrl = Storage::url($imagePath);

            // Retorna la URL de la imagen en la respuesta
            return response()->json([$application]);
            // return $application;
        } catch (\Throwable $th) {
            return response($th, 500);
        }
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

        $applications = Application::where('applicantId', $id)->get();

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
}
