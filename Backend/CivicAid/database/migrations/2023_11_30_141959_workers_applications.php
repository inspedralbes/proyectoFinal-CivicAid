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
        Schema::create('workers_applications', function (Blueprint $table) {
            $table->bigIncrements('applicationId');
            $table->unsignedBigInteger('applicantId');
            $table->unsignedBigInteger('assignedWorker');
            $table->enum('applicationStatus', ['active', 'inactive', 'pending', 'completed'])->default('pending');

            $table->foreign('applicationId')->references('applicationId')->on('applications'); // Define la clave foránea
            $table->foreign('applicantId')->references('id')->on('users'); // Define la clave foránea
            $table->foreign('assignedWorker')->references('id')->on('workers'); // Define la clave foránea
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers_applications');
    }
};
