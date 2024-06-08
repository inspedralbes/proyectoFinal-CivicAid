<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{

    /**
     * Create a new application.
     *
     * @OA\Post(
     *     path="/api/makeApplication",
     *     summary="Submit a new application",
     *     tags={"ApplicationController"},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data needed to create the application",
     *         @OA\JsonContent(
     *             required={"applicantId", "title", "description", "image", "sector", "subsector", "province", "location", "date"},
     *             @OA\Property(property="applicantId", type="integer", example=123),
     *             @OA\Property(property="title", type="string", example="New Community Center"),
     *             @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *             @OA\Property(property="image", type="string", format="binary"),
     *             @OA\Property(property="sector", type="string", example="Public"),
     *             @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *             @OA\Property(property="province", type="string", example="Madrid"),
     *             @OA\Property(property="location", type="string", example="Central Madrid"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-07-10"),
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="The application was created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="applicantId", type="integer", example=123),
     *             @OA\Property(property="title", type="string", example="New Community Center"),
     *             @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *             @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *             @OA\Property(property="sector", type="string", example="Public"),
     *             @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *             @OA\Property(property="province", type="string", example="Madrid"),
     *             @OA\Property(property="location", type="string", example="Central Madrid"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-07-10"),
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="An unexpected error occurred."),
     *             @OA\Property(property="error", type="string", example="Error message detailing what went wrong")
     *         )
     *     )
     * )
     */
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

            $imageUrl = $baseUrl . '/storage/' . $imagePath;

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


    /**
     * Retrieves a list of all applications from the database.
     *
     * This endpoint returns an array of all applications stored in the database, detailing each application's 
     * unique identifier, applicant ID, title, description, image URL, sector, subsector, province, location, 
     * and date of application.
     *
     * @OA\Get(
     *     path="/api/listApplications",
     *     operationId="listAllApplications",
     *     tags={"ApplicationController"},
     *     summary="List all applications",
     *     description="Returns a list of all applications stored in the database, each including detailed information such as ID, applicant ID, title, description, image URL, sector, subsector, province, location, and date.",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="applicantId", type="integer", example=123),
     *                 @OA\Property(property="title", type="string", example="New Community Center"),
     *                 @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *                 @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *                 @OA\Property(property="sector", type="string", example="Public"),
     *                 @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *               @OA\Property(property="applicationStatus", type="string", enum={"pending", "approved", "rejected"}, example="pending"),
     *                 @OA\Property(property="province", type="string", example="Madrid"),
     *                 @OA\Property(property="location", type="string", example="Central Madrid"),
     *                 @OA\Property(property="date", type="string", format="date", example="2024-07-10")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     */
    public function listApplications()
    {
        $application = Application::all();
        return $application;
    }

    /**
     * Retrieve applications based on sector.
     *
     * This endpoint filters and returns applications from the database that belong to a specified sector, providing details such as ID, applicant ID, title, description, image URL, sector, subsector, province, location, and date of application.
     *
     * @OA\Get(
     *     path="/api/listApplicationsSector",
     *     operationId="listApplicationsBySector",
     *     tags={"ApplicationController"},
     *     summary="List applications by sector",
     *     description="Returns a list of applications belonging to a specific sector, each including detailed information such as ID, applicant ID, title, description, image URL, sector, subsector, province, location, and date.",
     *     @OA\Parameter(
     *         name="sector",
     *         in="query",
     *         required=true,
     *         description="Sector of the applications to retrieve",
     *         @OA\Schema(
     *             type="string",
     *             example="Public"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="applicantId", type="integer", example=123),
     *                 @OA\Property(property="title", type="string", example="New Community Center"),
     *                 @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *                 @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *                 @OA\Property(property="sector", type="string", example="Public"),
     *                 @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *                 @OA\Property(property="province", type="string", example="Madrid"),
     *                 @OA\Property(property="location", type="string", example="Central Madrid"),
     *                 @OA\Property(property="date", type="string", format="date", example="2024-07-10")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No applications found for the specified sector"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     */

    /**
     * Retrieve applications submitted by the authenticated user.
     *
     * This endpoint retrieves and returns applications submitted by the authenticated user. Each application includes details such as ID, title, description, image URL, sector, subsector, province, location, and date of application.
     *
     * @OA\Get(
     *     path="/api/listOwnApplications",
     *     operationId="listUserApplications",
     *     tags={"ApplicationController"},
     *     summary="List user's applications",
     *     description="Retrieves applications submitted by the authenticated user, providing details such as ID, title, description, image URL, sector, subsector, province, location, and date of application.",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="applicantId", type="integer", example=123),
     *                 @OA\Property(property="title", type="string", example="New Community Center"),
     *                 @OA\Property(property="description", type="string", example="Proposal for constructing a new community center."),
     *                 @OA\Property(property="image", type="string", example="http://example.com/storage/images/1.jpg"),
     *                 @OA\Property(property="sector", type="string", example="Public"),
     *                 @OA\Property(property="subsector", type="string", example="Infrastructure"),
     *                 @OA\Property(property="province", type="string", example="Madrid"),
     *                 @OA\Property(property="location", type="string", example="Central Madrid"),
     *                 @OA\Property(property="date", type="string", format="date", example="2024-07-10")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error"
     *     )
     * )
     */
    public function listOwnApplications(Request $request)
    {
        $id = $request->userId;

        $applications = Application::where('applicantId', $id)->get();

        return response()->json($applications, 200);
    }

    /**
     * Update an existing application's details.
     *
     * @OA\Put(
     *     path="/api/updateApplication/{id}",
     *     tags={"ApplicationController"},
     *     summary="Update an existing application",
     *     description="Updates the specified fields of an existing application identified by its ID.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="The ID of the application to update",
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data required to update the application",
     *         @OA\JsonContent(
     *             required={"title", "description", "date"},
     *             @OA\Property(property="title", type="string", description="The new title of the application"),
     *             @OA\Property(property="description", type="string", description="The new description of the application"),
     *             @OA\Property(property="date", type="string", format="date", description="The new date of the event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Application updated successfully",
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Application not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Solicitud no encontrada")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Error interno del servidor")
     *         )
     *     )
     * )
     */
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
