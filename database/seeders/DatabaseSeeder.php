<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Memo;
use Illuminate\Support\Str;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        for ($i = 0; $i < 200; $i++) {
            $startDate = strtotime("2023-09-01");
            $endDate = strtotime("2024-03-31");
            $randomDate = date("Y-m-d", rand($startDate, $endDate));

            Memo::create([
                'user_id' => 1,
                'label_id' => rand(1, 7),
                'text' => Str::random(100), // 100文字のランダムな文字列
                'date' => $randomDate,
            ]);
        }
    }
}

