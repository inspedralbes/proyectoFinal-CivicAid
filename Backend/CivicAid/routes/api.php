<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\WorkerAuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\WorkerSigninRequest;
use App\Http\Controllers\Api\AdminController;

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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::post('/signIn', [AuthController::class, 'signIn']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/signinWorker', [WorkerAuthController::class, 'signinWorker']);
Route::post('/loginWorker', [WorkerAuthController::class, 'loginWorker']);

Route::post('/signinAdmin', [AdminAuthController::class, 'signinAdmin']);
Route::post('/loginAdmin', [AdminAuthController::class, 'loginAdmin']);

Route::post('/makeApplication', [ApplicationController::class, 'makeApplication']);
Route::get('/listApplications', [ApplicationController::class, 'listApplications']);
Route::post('/listOwnApplications', [ApplicationController::class, 'listOwnApplications']);
Route::post('/listApplicationsSector', [ApplicationController::class, 'listApplicationsSector']);
Route::post('/updateApplication/{id}', [ApplicationController::class, 'updateApplication']);
Route::post('/updateApplicationStatus/{id}', [ApplicationController::class, 'updateApplicationStatus']);


Route::get('/listProvinces', [WorkerSigninRequest::class, 'listProvinces']);
Route::get('/listSectors', [WorkerSigninRequest::class, 'listSectors']);
Route::post('/signinRequest', [WorkerSigninRequest::class, 'signinRequest']);

Route::get('/listRequests', [AdminController::class, 'listRequests']);



