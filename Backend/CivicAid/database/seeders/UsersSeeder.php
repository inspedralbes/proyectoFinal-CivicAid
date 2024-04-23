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
            'name' => 'Pablo',
            'surname' => 'García',
            'secondSurname' => 'López',
            'email' => 'pablo@example.com',
            'password' => 'Cm12345-',
        ]);

        User::create([
            'name' => 'Rosa',
            'surname' => 'Martínez',
            'secondSurname' => 'Sánchez',
            'email' => 'rosa@example.com',
            'password' => 'Cm12345-',
        ]);

        User::create([
            'name' => 'Carlos',
            'surname' => 'Gómez',
            'secondSurname' => 'Fuentes',
            'email' => 'carlos@example.com',
            'password' => 'Cm12345-',
        ]);

    }
}
