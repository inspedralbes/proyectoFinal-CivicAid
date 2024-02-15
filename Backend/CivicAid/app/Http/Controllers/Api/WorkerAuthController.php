<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Worker;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;


class WorkerAuthController extends Controller
{

    public function signinWorker(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'surname' => 'required',
            'secondSurname' => 'required',
            'sector' => 'required',
            'email' => 'required|email|unique:workers',
            'password' => 'required',
        ]);

        $worker = new Worker;
        $worker->name = $request->name;
        $worker->surname = $request->surname;
        $worker->secondSurname = $request->secondSurname;
        $worker->sector = $request->sector;
        $worker->email = $request->email;
        $worker->password = Hash::make($request->password);


        try {
            if ($worker->save()) {
                $message = "Registered correctly.";
                return response()->json([$message, 200, 'isRegistered' => true]);
            }
        } catch (QueryException $ex) {
            $message = "Couldn't register.";
            return response()->json([$message, 500, 'isRegistered' => false]);
        }
    }

    public function loginWorker(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // if (Auth::guard('worker')->attempt($credentials)) {
        //     $worker = Auth::guard('worker')->user();
        //     $token = $worker->createToken('token')->plainTextToken;
        //     return response([$token, $worker, 'isLoggedIn' => true]);
        // } else {
        //     return response(['isLoggedIn' => false]);
        // }


        // $credentials = $request->validate([
        //     'email' => ['required', 'email'],
        //     'password' => ['required'],
        // ]);

        // // $user = Auth::user();
        // $user = Auth::guard('worker')->attempt($credentials);
        // if ($user instanceof \App\Models\Worker) {
        //     // Hinting here for $user will be specific to the User object
        //     return $user->createToken('token')->plainTextToken;
        // } else {
        //     return response(['isLoggedIn' => false]);
        // }

        // Buscar el usuario por su correo electrónico
$user = Worker::where('email', $credentials['email'])->first();

// Verificar si el usuario existe y si la contraseña coincide
if ($user && Hash::check($credentials['password'], $user->password)) {
    // Autenticación exitosa, crear token de acceso personal
    $token = $user->createToken('token')->plainTextToken;
    return response([$token, $user, 'isLoggedIn' => true]);
} else {
    // Autenticación fallida
    return response(['isLoggedIn' => false]);
}

        // if (Auth::guard('worker')->attempt($credentials)) {
        //     $user = Auth::guard('worker')->user();
        //     $token = $user->createToken('token')->plainTextToken;
        //     return response([$token, $user, 'isLoggedIn' => true]);
        // } else {
        //     return response(['isLoggedIn' => false]);
        // }
        
        // $credentials = $request->validate([
        //     'email' => ['required', 'email'],
        //     'password' => ['required'],
        // ]);

        // if (Auth::attempt($credentials)) {
        //     return response('llega???');
        //     $worker = Auth::worker();
        //     $token = $worker->createToken('token')->plainTextToken;
        //     return response([$token, $worker, 'isLoggedIn' => true]);
        // } else {
        //     return response(['isLoggedIn' => false]);
        // }

        // $credentials = $request->validate([
        //     'email' => ['required', 'email'],
        //     'password' => ['required'],
        // ]);

        // if (Auth::guard('worker')->attempt($credentials)) {
        //     $details = Auth::guard('worker')->user();
        //     $worker = $details['original'];
        //     return response($worker);
        // } else {
        //     return 'auth fail';
        // }



        // ---------





    }
}
