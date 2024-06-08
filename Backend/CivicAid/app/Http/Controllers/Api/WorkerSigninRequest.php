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

    /**
     * Retrieves a list of all provinces.
     *
     * @OA\Get(
     *     path="/api/listProvinces",
     *     tags={"WorkerSigninRequest"},
     *     summary="List all provinces",
     *     description="Returns a list of all provinces stored in the database.",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="province", type="string", example="Barcelona"),
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     *
     */
    public function listProvinces()
    {

        $provinces = Province::all();

        return response()->json($provinces);
    }

    /**
     * Retrieves a list of all sectors.
     *
     * @OA\Get(
     *     path="/api/listSectors",
     *     tags={"WorkerSigninRequest"},
     *     summary="List all sectors",
     *     description="Returns a list of all sectors stored in the database.",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="sector", type="string", example="Bomberos"),
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     *
     */
    public function listSectors()
    {

        $sectors = Sector::all();

        return response()->json($sectors);
    }


    /**
     * Signs up a worker request.
     *
     * This function handles the signup process for a worker request. It validates the incoming data, creates a new worker
     * request record, stores it in the database, and sends an email notification. It utilizes transactions to ensure data
     * integrity and rollback in case of any errors.
     *
     * @OA\Post(
     *     path="/api/signinRequest",
     *     tags={"WorkerSigninRequest"},
     *     summary="Sign up a worker request",
     *     description="Registers a new worker request and sends a notification email.",
     *     @OA\RequestBody(
     *         required=true,
     *         description="Worker request details",
     *         @OA\JsonContent(
     *             required={"dni", "name", "surname", "secondSurname", "profileImage", "sector", "requestedLocation", "email"},
     *             @OA\Property(property="dni", type="string", description="The DNI of the worker", example="12345678A"),
     *             @OA\Property(property="name", type="string", description="The name of the worker", example="John"),
     *             @OA\Property(property="surname", type="string", description="The surname of the worker", example="Doe"),
     *             @OA\Property(property="secondSurname", type="string", description="The second surname of the worker", example="Smith"),
     *             @OA\Property(property="profileImage", type="string", description="The URL of the worker's profile image", example="http://example.com/profile.jpg"),
     *             @OA\Property(property="sector", type="string", description="The sector of the worker", example="Engineering"),
     *             @OA\Property(property="requestedLocation", type="string", description="The requested location of the worker", example="City"),
     *             @OA\Property(property="email", type="string", format="email", description="The email of the worker", example="john@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Request registered successfully",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="string",
     *                 example="Request registered correctly."
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="string",
     *                 example="Error al procesar la solicitud de registro."
     *             )
     *         )
     *     )
     * )
     *
     */

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
                'profileImage' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Permitir solo ciertas extensiones de archivo
                'sector' => 'required',
                'requestedLocation' => 'required',
                'email' => 'required|email|unique:workers_requests',
            ]);

            // Creación y guardado de la solicitud
            $workerRequest = new SigninRequest;
            $workerRequest->dni = $request->dni;
            $workerRequest->name = $request->name;
            $workerRequest->surname = $request->surname;
            $workerRequest->secondSurname = $request->secondSurname;
            $workerRequest->sector = $request->sector;
            $workerRequest->requestedLocation = $request->requestedLocation;
            $workerRequest->email = $request->email;

            $profileImagePath = $request->file('profileImage')->store('images', 'public');

            // Construye la URL del archivo concatenando el path de almacenamiento con el nombre del archivo
            $baseUrl = config('app.url');
            $port = ':8000';
            $imageUrl = $baseUrl . '/storage/' . $profileImagePath;

            // Almacena la URL en la base de datos
            $workerRequest->profileImage = $imageUrl;

            $workerRequest->save();

            // Enviar el correo electrónico
            Log::error('Construyendo URL: ' . $baseUrl);
            Log::error('Intentando enviar email a: ' . $request->email);

            try {
                Mail::to($request->email)->send(new registrationRequestEmail($workerRequest));
            } catch (\Exception $exception) {
                // Registrar el error
                Log::error('Error al enviar el correo electrónico de solicitud de registro: ' . $exception->getMessage());

                return response()->json(['error' => 'Error al enviar el correo electrónico de solicitud de registro.'], 500);
            }

            DB::commit();

            // Respuesta exitosa
            $message = "Request registered correctly.";
            return response()->json([$message]);
        } catch (\Throwable $e) {
            // Algo ha fallado, hacemos rollback
            DB::rollBack();

            Log::error('Error al procesar la solicitud de registro: ' . $e->getMessage());

            // $errorMessage = 'Error al procesar la solicitud de registro.';
            // return response()->json([$e], 500);
            return response("DA ERROR EN CONTROLADOR", $e);
        }
    }
}
