<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workers_requests', function (Blueprint $table) {
            $table->increments('requestId');
            $table->string('applicantId');
            $table->string('assignedWorker');
            $table->enum('requestState', ['active', 'inactive', 'pending', 'completed'])->default('pending');

            $table->foreign('requestId')->references('requestId')->on('requests'); // Define la clave foránea
            $table->foreign('applicantId')->references('citizenId')->on('users'); // Define la clave foránea
            $table->foreign('assignedWorker')->references('workerId')->on('workers'); // Define la clave foránea
    
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers_requests');
    }
};
