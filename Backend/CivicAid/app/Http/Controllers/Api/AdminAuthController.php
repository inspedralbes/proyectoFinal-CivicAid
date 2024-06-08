<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
// use OpenApi\Attributes as OA;
// use OpenApi\Attributes as OA;
use OpenApi\Annotations as OA;

/**
* @OA\Info(title="API CivicAid", version="1.0")
*
* @OA\Server(url="https://civic.civicaid.daw.inspedralbes.cat/laravel")
*/
class AdminAuthController extends Controller
{

/**
 * Register a new admin.
 *
 * @OA\Post(
 *     path="/api/signinAdmin",
 *     summary="Register a new admin",
 *     tags={"AdminAuthController"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"name","surname","secondSurname","assignedLocation","email","password"},
 *             @OA\Property(property="name", type="string", example="John"),
 *             @OA\Property(property="surname", type="string", example="Doe"),
 *             @OA\Property(property="secondSurname", type="string", example="Smith"),
 *             @OA\Property(property="assignedLocation", type="string", example="Location"),
 *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
 *             @OA\Property(property="password", type="string", example="password123"),
 *         ),
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Registered correctly",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Registered correctly."),
 *             @OA\Property(property="isRegistered", type="boolean", example=true),
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Couldn't register",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Couldn't register."),
 *             @OA\Property(property="isRegistered", type="boolean", example=false),
 *         )
 *     )
 * )
 */
    public function signinAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'surname' => 'required',
            'secondSurname' => 'required',
            'assignedLocation' => 'required',
            'email' => 'required|email|unique:admins',
            'password' => 'required',
        ]);

        $admin = new Admin;
        $admin->name = $request->name;
        $admin->surname = $request->surname;
        $admin->secondSurname = $request->secondSurname;
        $admin->assignedLocation = $request->assignedLocation;
        $admin->email = $request->email;
        $admin->password = Hash::make($request->password);

        try {
            if ($admin->save()) {
                $message = "Registered correctly.";
                return response()->json([$message, 200, 'isRegistered' => true]);
            }
        } catch (QueryException $ex) {
            $message = "Couldn't register.";
            return response()->json([$message, 500, 'isRegistered' => false]);
        }
    }

    
/**
 * Log in as admin.
 *
 * @OA\Post(
 *     path="/api/loginAdmin",
 *     summary="Log in as admin",
 *     tags={"AdminAuthController"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"email","password"},
 *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
 *             @OA\Property(property="password", type="string", example="password123"),
 *         ),
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Logged in correctly",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Logged in correctly."),
 *             @OA\Property(property="isRegistered", type="boolean", example=true),
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Couldn't log in",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Couldn't log in."),
 *             @OA\Property(property="isRegistered", type="boolean", example=false),
 *         )
 *     )
 * )
 */
    public function loginAdmin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Buscar el usuario por su correo electrónico
        $user = Admin::where('email', $credentials['email'])->first();

        // Verificar si el usuario existe y si la contraseña coincide
        if ($user && Hash::check($credentials['password'], $user->password)) {
            // Autenticación exitosa, crear token de acceso personal
            $token = $user->createToken('token')->plainTextToken;
            return response([$token, $user, 'isLoggedIn' => true]);
        } else {
            // Autenticación fallida
            return response(['isLoggedIn' => false]);
        }
    }
}
