<?php

namespace App\Http\Controllers;

use App\Models\BloodTest;
use Inertia\Inertia;
use Inertia\Response;

class BloodTestController extends Controller
{
    public function index(): Response
    {
        $bloodTests = BloodTest::query()
            ->active()
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        return Inertia::render('blood-tests/index', [
            'bloodTests' => $bloodTests,
        ]);
    }
}
