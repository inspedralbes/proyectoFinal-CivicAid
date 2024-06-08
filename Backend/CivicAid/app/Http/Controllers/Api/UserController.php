<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;


use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Retrieve user details based on user ID.
     *
     * This endpoint retrieves and returns user details based on the provided user ID. The response includes the user ID, name, surname, second surname, profile image URL, email, and created date.
     *
     * @OA\Get(
     *     path="/api/listApplicationsSector",
     *     operationId="getUserById",
     *     tags={"UserController"},
     *     summary="Get user details by ID",
     *     description="Retrieves user details based on the provided user ID, returning user ID, name, surname, second surname, profile image URL, email, and created date.",
     *     @OA\Parameter(
     *         name="userId",
     *         in="query",
     *         required=true,
     *         description="ID of the user to retrieve details for",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John"),
     *                 @OA\Property(property="surname", type="string", example="Doe"),
     *                 @OA\Property(property="secondSurname", type="string", example="Smith"),
     *                 @OA\Property(property="profileImage", type="string", example="http://example.com/storage/images/profile.jpg"),
     *                 @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-07-10T14:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-07-10T14:00:00Z")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error retrieving user details"
     *     )
     * )
     */

    public function listApplicationsSector(Request $request)
    {
        try {
            $userId = $request->userId;

            $user = User::where('id', $userId)->get();

            return response()->json($user, 200);
        } catch (\Throwable $th) {
            return response("Error al buscar el usuario", 500);
        }
    }
}
