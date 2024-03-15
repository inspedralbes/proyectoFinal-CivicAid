<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;

use App\Models\SigninRequest;
use App\Models\Worker;


class AdminController extends Controller
{
    public function listRequests()
    {
        $request = SigninRequest::all();
        return $request;
    }

    public function acceptRequest(Request $request)
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
        $worker->assignedLocation = $request->assignedLocation;
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
}
