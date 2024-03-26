<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Juan',
            'surname' => 'García',
            'secondSurname' => 'López',
            'email' => 'juan@example.com',
            'password' => 'Cm12345-',
        ]);

        User::create([
            'name' => 'María',
            'surname' => 'Martínez',
            'secondSurname' => 'Sánchez',
            'email' => 'maria@example.com',
            'password' => 'Cm12345-',
        ]);

    }
}
