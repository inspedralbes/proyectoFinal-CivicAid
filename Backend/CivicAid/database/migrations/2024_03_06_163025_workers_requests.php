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
            $table->id();
            $table->string('dni');
            $table->string('name');
            $table->string('surname');
            $table->string('secondSurname');
            $table->binary('profileImage'); 
            $table->string('sector');
            $table->string('requestedLocation');
            $table->string('email')->unique();
            $table->enum('requestStatus', ['accepted', 'denied', 'pending'])->default('pending');
            
            $table->timestamps();
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
