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
        // $credentials = $request->validate([
        //     'email' => ['required', 'email'],
        //     'password' => ['required'],
        // ]);

        // if (Auth::guard('worker')->attempt($credentials)) {
        //     $details = Auth::guard('worker')->user();
        //     $user = $details['original'];
        //     return $user;
        // } else {
        //     return 'auth fail';
        // }



        // ---------


        // $credentials = $request->validate([
        //     'email' => ['required', 'email'],
        //     'password' => ['required'],
        // ]);

        // if (Auth::guard('worker')->attempt($credentials)) {
        //     $worker = Auth::guard('worker')->user();
        //     $token = $worker->createToken('token')->plainTextToken;
        //     return response([$token, $worker, 'isLoggedIn' => true]);
        // } else {
        //     return response(['isLoggedIn' => false]);
        // }

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('worker')->attempt($credentials)) {
            $worker = Auth::guard('worker')->user();
            $token = $worker->createToken('token')->plainTextToken;
            return response([$token, $worker, 'isLoggedIn' => true]);
        } else {
            return response(['isLoggedIn' => false]);
        }
    }
}
