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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('adminId');
            $table->unsignedBigInteger('applicationId');
            $table->unsignedBigInteger('workerId');

            $table->foreign('adminId')->references('id')->on('admins');
            $table->foreign('applicationId')->references('id')->on('applications');
            $table->foreign('workerId')->references('id')->on('workers');
        }, ['charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');

    }
};
