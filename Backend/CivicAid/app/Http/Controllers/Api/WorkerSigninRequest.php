<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\registrationRequestEmail;
// use App\Mail\registrationRequestDenied;
use App\Mail\PruebaMail;

use App\Models\Province;
use App\Models\Sector;
use App\Models\SigninRequest;
// use PhpParser\Node\Stmt\TryCatch;
// use Throwable;

class WorkerSigninRequest extends Controller
{
    public function listProvinces()
    {

        $provinces = Province::all();

        return response()->json($provinces);
    }

    public function listSectors()
    {

        $sectors = Sector::all();

        return response()->json($sectors);
    }

    public function signinRequest(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validación de los datos
            $validatedData = $request->validate([
                'dni' => 'required|unique:workers_requests,dni',
                'name' => 'required',
                'surname' => 'required',
                'secondSurname' => 'required',
                // 'profileImage' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Permitir solo ciertas extensiones de archivo
                // 'sector' => 'required',
                // 'requestedLocation' => 'required',
                'email' => 'required|email|unique:workers_requests',
            ]);

            // Creación y guardado de la solicitud
            $workerRequest = new SigninRequest;
            $workerRequest->dni = $request->dni;
            $workerRequest->name = $request->name;
            $workerRequest->surname = $request->surname;
            $workerRequest->secondSurname = $request->secondSurname;
            // $workerRequest->sector = $request->sector;
            // $workerRequest->requestedLocation = $request->requestedLocation;
            $workerRequest->email = $request->email;

            // $profileImagePath = $request->file('profileImage')->store('images', 'public');

            // Construye la URL del archivo concatenando el path de almacenamiento con el nombre del archivo
            // $baseUrl = config('app.url');
            // $port = ':' . config('app.port');
            // $imageUrl = $baseUrl . $port . '/storage/' . $profileImagePath;

            // Almacena la URL en la base de datos
            // $workerRequest->profileImage = $imageUrl;

            $workerRequest->save();

            // Enviar el correo electrónico
            
            // Log::error('Intentando enviar email a: ' . $request->email);
            // try {
            //     Mail::to($request->email)->send(new registrationRequestEmail($workerRequest));
            // } catch (\Exception $exception) {
            //     // Registrar el error
            //     Log::error('Error al enviar el correo electrónico de solicitud de registro: ' . $exception->getMessage());

            //     // Devolver una respuesta adecuada
            //     return response()->json(['error' => 'Error al enviar el correo electrónico de solicitud de registro.'], 500);
            // }

            // Todo ha ido bien, hacemos commit
            DB::commit();

            // Respuesta exitosa
            $message = "Request registered correctly.";
            return response()->json([$message]);
        } catch (\Throwable $e) {
            // Algo ha fallado, hacemos rollback
            DB::rollBack();

            // Logueamos el error
            Log::error('Error al procesar la solicitud de registro: ' . $e->getMessage());

            // Respondemos con un mensaje de error genérico
            // $errorMessage = 'Error al procesar la solicitud de registro.';
            // return response()->json([$e], 500);
            return response("DA ERROR EN CONTROLADOR", $e);
        }
    }
}
