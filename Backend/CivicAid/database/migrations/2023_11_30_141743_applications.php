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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('applicantId');
            $table->string('title');
            $table->string('description');
            $table->binary('image'); 
            $table->string('sector');
            $table->string('subsector');
            $table->enum('applicationStatus', ['active', 'inactive', 'pending', 'completed'])->default('pending');
            $table->string('province');
            $table->string('location');
            $table->date('date');
            $table->timestamps();

        }, ['charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
