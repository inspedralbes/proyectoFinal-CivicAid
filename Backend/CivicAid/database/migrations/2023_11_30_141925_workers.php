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
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('approvedBy');
            $table->string('dni');
            $table->string('name');
            $table->string('surname');
            $table->string('secondSurname');
            $table->string('profileImage')->nullable(); 
            $table->string('sector');
            $table->string('assignedLocation');
            $table->enum('workerStatus', ['inService', 'available'])->default('available');
            $table->integer('assignedApplications');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamps();

            $table->foreign('approvedBy')->references('id')->on('admins');

        }, ['charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
