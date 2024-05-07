<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;


use Illuminate\Http\Request;

class UserController extends Controller
{
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
