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

    /**
     * Register a new user.
     *
     * @OA\Post(
     *     path="/api/signIn",
     *     tags={"AuthController"},
     *     summary="Register a new user",
     *     description="Registers a new user in the system with the provided information.",
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data required to register a new user",
     *         @OA\JsonContent(
     *             required={"name", "surname", "secondSurname", "profileImage", "email", "password"},
     *             @OA\Property(property="name", type="string", description="The user's first name"),
     *             @OA\Property(property="surname", type="string", description="The user's last name"),
     *             @OA\Property(property="secondSurname", type="string", description="The user's second last name"),
     *             @OA\Property(property="profileImage", type="string", format="binary", description="The user's profile image"),
     *             @OA\Property(property="email", type="string", format="email", description="The user's email address"),
     *             @OA\Property(property="password", type="string", format="password", description="The user's password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User signed in successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Signed in correctly."),
     *             @OA\Property(property="isRegistered", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Couldn't sign in."),
     *             @OA\Property(property="isRegistered", type="boolean", example=false)
     *         )
     *     )
     * )
     */
    public function signIn(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'surname' => 'required',
            'secondSurname' => 'required',
            'profileImage' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Permitir solo ciertas extensiones de archivo
            'email' => 'required|email|unique:users',
            'password' => 'required',
        ]);

        $user = new User;
        $user->name = $request->name;
        $user->surname = $request->surname;
        $user->secondSurname = $request->secondSurname;
        $user->email = $request->email;
        $user->password = Hash::make($request->password);

        $profileImagePath = $request->file('profileImage')->store('images', 'public');

        // Construye la URL del archivo concatenando el path de almacenamiento con el nombre del archivo
        $baseUrl = config('app.url');
        $port = ':8000';

        $imageUrl = $baseUrl . '/storage/' . $profileImagePath;

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


    /**
     * Authenticate a user and provide a token for subsequent requests.
     *
     * @OA\Post(
     *     path="/api/login",
     *     tags={"AuthController"},
     *     summary="Authenticate user",
     *     description="Authenticates a user and provides a token for subsequent requests.",
     *     @OA\RequestBody(
     *         required=true,
     *         description="Credentials needed for login",
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", description="User's email address"),
     *             @OA\Property(property="password", type="string", format="password", description="User's password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful login",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", description="Bearer token for authenticating future requests"),
     *             @OA\Property(property="isLoggedIn", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unsuccessful login",
     *         @OA\JsonContent(
     *             @OA\Property(property="isLoggedIn", type="boolean", example=false)
     *         )
     *     )
     * )
     */
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
}
