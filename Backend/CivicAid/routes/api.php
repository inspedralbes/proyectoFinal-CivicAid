<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\WorkerAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/signIn', [AuthController::class, 'signIn']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('/signinWorker', [WorkerAuthController::class, 'signinWorker']);

Route::post('/loginWorker', [WorkerAuthController::class, 'loginWorker']);

Route::post('/makeApplication', [ApplicationController::class, 'makeApplication']);

Route::post('/updateApplication/{id}', [ApplicationController::class, 'updateApplication']);

Route::get('/listApplications', [ApplicationController::class, 'listApplications']);

Route::post('/listApplicationsSector', [ApplicationController::class, 'listApplicationsSector']);

Route::post('/updateApplicationStatus/{id}', [ApplicationController::class, 'updateApplicationStatus']);

Route::post('/listOwnApplications', [ApplicationController::class, 'listOwnApplications']);