<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // DB::table('users')->insert([
        //     'name' => 'Romel Irog Irog',
        //     'email' => 'cathleen.abila@lsu.edu.ph',
        //     'email_verified_at' => now(),
        //     'password' => Hash::make('password123'),
        // ]);
        DB::table('email_notifications')->delete();

    }
}
