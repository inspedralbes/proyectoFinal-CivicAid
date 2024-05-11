<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    public function signIn(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'surname' => 'required',
            'secondSurname' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
        ]);

        $user = new User;
        $user->name = $request->name;
        $user->surname = $request->surname;
        $user->secondSurname = $request->secondSurname;
        $user->email = $request->email;
        $user->password = Hash::make($request->password);

        $profileImagePath = $request->file('image')->store('usersProfileImages', 'public');

        // Construye la URL del archivo concatenando el path de almacenamiento con el nombre del archivo
        $baseUrl = config('app.url');
        $port = ':8000'; // Define el puerto aquí

        $imageUrl = $baseUrl . $port . '/storage/' . $profileImagePath;

        // Almacena la URL en la base de datos
        $user->profileImage = $imageUrl;

        try {
            if ($user->save()) {
                $message = "Signed in correctly.";
                return response()->json([$message, 200, 'isRegistered' => true]);
            }
        } catch (QueryException $ex) {
            $message = "Couldn't sign in.";
            return response()->json([$message, 500, 'isRegistered' => false]);
        }
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('token')->plainTextToken;
            return response([$token, $user, 'isLoggedIn' => true]);
        } else {
            return response(['isLoggedIn' => false]);
        }
    }

    // public function loginWorker(Request $request)
    // {
    //     $credentials = $request->validate([
    //         'email' => ['required', 'email'],
    //         'password' => ['required'],
    //     ]);

    //     if (Auth::attempt($credentials)) {
    //         $worker = Auth::worker();
    //         $token = $worker->createToken('token')->plainTextToken;
    //         return response([$token, $worker, 'isLoggedIn' => true]);
    //     } else {
    //         return response(['isLoggedIn' => false]);
    //     }
    // }
}
