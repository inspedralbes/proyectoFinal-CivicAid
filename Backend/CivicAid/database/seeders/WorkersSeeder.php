<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Worker;

class WorkersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Worker::create([
            'dni' => '12345678A',
            'name' => 'Juan',
            'surname' => 'García',
            'secondSurname' => 'López',
            'sector' => 'Servicios Médicos',
            'assignedLocation' => 'Barcelona',
            'workerStatus' => 'available',
            'assignedApplications' => 0,
            'email' => 'juan@example.com',
            'password' => 'Cm12345-',
        ]);

        Worker::create([
            'dni' => '87654321B',
            'name' => 'María',
            'surname' => 'Martínez',
            'secondSurname' => 'Sánchez',
            'sector' => 'Servicios Médicos',
            'assignedLocation' => 'Madrid',
            'workerStatus' => 'available',
            'assignedApplications' => 0,
            'email' => 'maria@example.com',
            'password' => 'Cm12345-',
        ]);

        Worker::create([
            'dni' => '13579246C',
            'name' => 'Pedro',
            'surname' => 'Fernández',
            'secondSurname' => 'Gómez',
            'sector' => 'Servicios Médicos',
            'assignedLocation' => 'Sevilla',
            'workerStatus' => 'available',
            'assignedApplications' => 0,
            'email' => 'pedro@example.com',
            'password' => 'Cm12345-',
        ]);
    }
}
