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

use App\Models\Province;
use App\Models\Sector;
use App\Models\SigninRequest;
use Throwable;

class WorkerSigninRequest extends Controller
{
    public function listProvinces(){

        $provinces = Province::all();

        return response()->json($provinces);
    }

    public function listSectors(){

        $sectors = Sector::all();

        return response()->json($sectors);
    }

    public function signinRequest(Request $request)
    {
        try {
            DB::beginTransaction();
            
            // Validación de los datos
            $validatedData = $request->validate([
                'name' => 'required',
                'surname' => 'required',
                'secondSurname' => 'required',
                'sector' => 'required',
                'requestedLocation' => 'required',
                'email' => 'required|email|unique:workers_requests',
            ]);
        
            // Creación y guardado de la solicitud
            $workerRequest = new SigninRequest;
            $workerRequest->name = $request->name;
            $workerRequest->surname = $request->surname;
            $workerRequest->secondSurname = $request->secondSurname;
            $workerRequest->sector = $request->sector;
            $workerRequest->requestedLocation = $request->requestedLocation;
            $workerRequest->email = $request->email;
        
            $workerRequest->save();
        
            // Envío del email
            // Mail::to($request->email)->send(new registrationRequestEmail($workerRequest));
    
            // Todo ha ido bien, hacemos commit
            DB::commit();
        
            // Respuesta exitosa
            $message = "Request registered correctly.";
            return response()->json([$message]);
        } catch (\Throwable $e) {
            // Algo ha fallado, hacemos rollback
            DB::rollBack();
        
            // Logueamos el error
            // Log::error('Error al procesar la solicitud de registro: ' . $e->getMessage());
        
            // Respondemos con un mensaje de error genérico
            // $errorMessage = 'Error al procesar la solicitud de registro.';
            // return response()->json([$e], 500);
            return response("DA ERROR EN CONTROLADOR", $e);
        }
    }
}
