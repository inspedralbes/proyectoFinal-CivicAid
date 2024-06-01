<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\WorkerAuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\WorkerSigninRequest;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\WorkerApplicationController;


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


Route::get('/listProvinces', [WorkerSigninRequest::class, 'listProvinces']);
Route::get('/listSectors', [WorkerSigninRequest::class, 'listSectors']);
Route::post('/signinRequest', [WorkerSigninRequest::class, 'signinRequest']);

Route::post('/listRequests', [AdminController::class, 'listRequests']);
Route::post('/acceptRequest', [AdminController::class, 'acceptRequest']);
Route::post('/updateRequestStatus/{id}', [AdminController::class, 'updateRequestStatus']);
Route::post('/listApplicationsLocation', [AdminController::class, 'listApplicationsLocation']); 
Route::post('/listWorkers', [AdminController::class, 'listWorkers']); 
Route::post('/assignApplication', [AdminController::class, 'assignApplication']); 
Route::post('/listAcceptedSignInRequests', [AdminController::class, 'listAcceptedSignInRequests']); 
Route::post('/listAssignedApplicationsWorkers', [AdminController::class, 'listAssignedApplicationsWorkers']); 

Route::post('/listAssignedApplications', [WorkerApplicationController::class, 'listAssignedApplications']); 
Route::post('/checkOngoingApp', [WorkerApplicationController::class, 'checkOngoingApp']); 
Route::post('/updateApplicationStatus/{id}', [WorkerApplicationController::class, 'updateApplicationStatus']);
Route::post('/applicationCompleted', [WorkerApplicationController::class, 'applicationCompleted']);
Route::post('/applicationNodeCompleted', [WorkerApplicationController::class, 'applicationNodeCompleted']);
Route::post('/listApplicationMultipleWorkers', [WorkerApplicationController::class, 'listApplicationMultipleWorkers']);
Route::post('/listWorkersExactApplication', [WorkerApplicationController::class, 'listWorkersExactApplication']);



