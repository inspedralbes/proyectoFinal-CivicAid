<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Application;

class ApplicationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Application::create([
            'applicantId' => '2',
            'title' => 'MUCHAS PRUEBAS',
            'description' => 'adedfefweferer',
            'sector' => 'Servicios Médicos',
            'subsector' => 'Ambulancias',
            'applicationStatus' => 'pending',
            'province' => 'Barcelona',
            'location' => 'Carrer del Llebeig',
            'date' => '2024-04-13',

        ]);

        Application::create([
            'applicantId' => '1',
            'title' => 'MUCHAS PRUEBAS 2',
            'description' => 'adedfefweferer',
            'sector' => 'Servicios Médicos',
            'subsector' => 'Ambulancias',
            'applicationStatus' => 'pending',
            'province' => 'Barcelona',
            'location' => 'Carrer del Llebeig',
            'date' => '2024-04-13',

        ]);

        Application::create([
            'applicantId' => '1',
            'title' => 'MUCHAS PRUEBAS 3',
            'description' => 'adedfefweferer',
            'sector' => 'Servicios Médicos',
            'subsector' => 'Ambulancias',
            'applicationStatus' => 'pending',
            'province' => 'Barcelona',
            'location' => 'Carrer del Llebeig',
            'date' => '2024-04-13',

        ]);

        Application::create([
            'applicantId' => '1',
            'title' => 'MUCHAS PRUEBAS 4',
            'description' => 'adedfefweferer',
            'sector' => 'Servicios Médicos',
            'subsector' => 'Ambulancias',
            'applicationStatus' => 'pending',
            'province' => 'Barcelona',
            'location' => 'Carrer del Llebeig',
            'date' => '2024-04-13',

        ]);

        Application::create([
            'applicantId' => '2',
            'title' => 'MUCHAS PRUEBAS 5',
            'description' => 'adedfefweferer',
            'sector' => 'Servicios Médicos',
            'subsector' => 'Ambulancias',
            'applicationStatus' => 'pending',
            'province' => 'Barcelona',
            'location' => 'Carrer del Llebeig',
            'date' => '2024-04-13',

        ]);

        Application::create([
            'applicantId' => '1',
            'title' => 'MUCHAS PRUEBAS 6',
            'description' => 'adedfefweferer',
            'sector' => 'Servicios Médicos',
            'subsector' => 'Ambulancias',
            'applicationStatus' => 'pending',
            'province' => 'Barcelona',
            'location' => 'Carrer del Llebeig',
            'date' => '2024-04-13',

        ]);
    }
}
