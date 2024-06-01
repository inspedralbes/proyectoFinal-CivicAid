<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectorsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sectors = [
            'Servicios Médicos', 'Bomberos', 'Policía', 'Protección Civil', 'Servicios de Agua y Saneamiento', 'Servicios de Electricidad', 'Recogida de Residuos y Limpieza Urbana', 'Servicios de Recogida de Poda y Residuos Verdes', 'Servicios Sociales'
        ];

        foreach ($sectors as $sector) {
            DB::table('sectors')->insert([
                'sector' => $sector
            ]);
        }    }
    
}
