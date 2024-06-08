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


    /**
     * Register a new worker.
     *
     * @OA\Post(
     *     path="/api/signinWorker",
     *     operationId="signinWorker",
     *     tags={"WorkerAuthController"},
     *     summary="Register a new worker",
     *     description="Registers a new worker and saves their profile information.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="approvedBy", type="string", example="Manager"),
     *             @OA\Property(property="name", type="string", example="John"),
     *             @OA\Property(property="surname", type="string", example="Doe"),
     *             @OA\Property(property="secondSurname", type="string", example="Smith"),
     *             @OA\Property(property="profileImage", type="string", format="binary", description="Profile image file"),
     *             @OA\Property(property="sector", type="string", example="Construction"),
     *             @OA\Property(property="assignedLocation", type="string", example="New York"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Registered correctly",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Registered correctly."),
     *             @OA\Property(property="code", type="integer", example=200),
     *             @OA\Property(property="isRegistered", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Couldn't register",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Couldn't register."),
     *             @OA\Property(property="code", type="integer", example=500),
     *             @OA\Property(property="isRegistered", type="boolean", example=false)
     *         )
     *     )
     * )
     */
    public function signinWorker(Request $request)
    {
        $request->validate([
            'id' => 'required',
            'approvedBy' => 'required',
            'name' => 'required',
            'surname' => 'required',
            'secondSurname' => 'required',
            'profileImage' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Permitir solo ciertas extensiones de archivo
            'sector' => 'required',
            'email' => 'required|email|unique:workers',
            'password' => 'required',
        ]);

        $worker = new Worker;
        $worker->id = $request->id;
        $worker->approvedBy = $request->approvedBy;
        $worker->name = $request->name;
        $worker->surname = $request->surname;
        $worker->secondSurname = $request->secondSurname;
        $worker->sector = $request->sector;
        $worker->assignedLocation = $request->assignedLocation;
        $worker->email = $request->email;
        $worker->password = Hash::make($request->password);

        $profileImagePath = $request->file('profileImage')->store('images', 'public');

        // Construye la URL del archivo concatenando el path de almacenamiento con el nombre del archivo
        $baseUrl = config('app.url');
        $port = ':8000'; // Define el puerto aquí

        $imageUrl = $baseUrl . '/storage/' . $profileImagePath;

        // Almacena la URL en la base de datos
        $worker->profileImage = $imageUrl;


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


    /**
     * Authenticates a worker and issues a token.
     *
     * @OA\Post(
     *     path="/api/loginWorker",
     *     operationId="loginWorker",
     *     tags={"WorkerAuthController"},
     *     summary="Login a worker",
     *     description="Authenticates a worker using their email, DNI, and password, and issues a token if successful.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="dni", type="string", example="12345678X"),
     *             @OA\Property(property="email", type="string", format="email", example="example@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", example="2|I9fG2AsdF6ar1t1dmIp2zGdbYMRDq8Y4txCMZAnP"),
     *             @OA\Property(property="isLoggedIn", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="isLoggedIn", type="boolean", example=false)
     *         )
     *     )
     * )
     */
    public function loginWorker(Request $request)
    {
        $credentials = $request->validate([
            'dni' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = Worker::where('email', $credentials['email'])->where('dni', $credentials['dni'])->first();

        if ($user && Hash::check($credentials['password'], $user->password)) {
            $token = $user->createToken('token')->plainTextToken;

            return response([$token, $user, 'isLoggedIn' => true]);
        } else {
            return response(['isLoggedIn' => false]);
        }
    }
}
