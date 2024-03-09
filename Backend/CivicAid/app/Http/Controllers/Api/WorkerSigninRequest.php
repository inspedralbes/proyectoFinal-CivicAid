<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\registrationRequestEmail;

use App\Models\Province;
use App\Models\SigninRequest;

class WorkerSigninRequest extends Controller
{
    public function listProvinces(){

        $provinces = Province::all();

        return $provinces;
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
            Mail::to($request->email)->send(new registrationRequestEmail($workerRequest));
        
            // Todo ha ido bien, hacemos commit
            DB::commit();
        
            // Respuesta exitosa
            $message = "Request registered correctly.";
            return response()->json([$message]);
        } catch (\Throwable $e) {
            // Algo ha fallado, hacemos rollback
            DB::rollBack();
        
            // Respondemos con el error
            $errorMessage = 'Error: ' . $e->getMessage();
            return response()->json([$errorMessage], 500);
        }
    }
}
