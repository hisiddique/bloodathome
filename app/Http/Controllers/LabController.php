<?php

namespace App\Http\Controllers;

use App\Models\Lab;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Lab::query()->available();

        if ($request->filled('postcode')) {
            $query->where('postcode', 'like', '%' . $request->postcode . '%');
        }

        $labs = $query->orderBy('rating', 'desc')
            ->paginate(12);

        return Inertia::render('labs/index', [
            'labs' => $labs,
            'filters' => $request->only(['postcode']),
        ]);
    }

    public function show(Lab $lab): Response
    {
        return Inertia::render('labs/show', [
            'lab' => $lab,
        ]);
    }
}
