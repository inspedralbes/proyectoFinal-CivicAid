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
            $table->string('id')->primary();
            $table->string('name');
            $table->string('surname');
            $table->string('secondSurname');
            $table->string('sector');
            $table->string('assignedLocation');
            $table->enum('workerStatus', ['inService', 'available'])->default('available');
            $table->integer('assignedApplications');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
