<?php

namespace App\Http\Controllers;

use App\Models\Phlebotomist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PhlebotomistController extends Controller
{
    public function search(): Response
    {
        return Inertia::render('search/index');
    }

    public function results(Request $request): Response
    {
        $query = Phlebotomist::query()
            ->approved()
            ->available();

        if ($request->filled('postcode')) {
            $query->where('service_area', 'like', '%' . $request->postcode . '%');
        }

        if ($request->filled('specialty')) {
            $query->whereJsonContains('specialties', $request->specialty);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $phlebotomists = $query->orderBy('rating', 'desc')
            ->paginate(12);

        return Inertia::render('search/results', [
            'phlebotomists' => $phlebotomists,
            'filters' => $request->only(['postcode', 'specialty', 'max_price']),
        ]);
    }

    public function show(Phlebotomist $phlebotomist): Response
    {
        $phlebotomist->load('user');

        return Inertia::render('phlebotomist/show', [
            'phlebotomist' => $phlebotomist,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'experience' => 'required|string',
            'price' => 'required|numeric|min:0',
            'bio' => 'nullable|string',
            'specialties' => 'nullable|array',
            'service_area' => 'nullable|string',
            'certifications' => 'nullable|string',
        ]);

        $phlebotomist = Phlebotomist::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'experience' => $validated['experience'],
            'price' => $validated['price'],
            'bio' => $validated['bio'] ?? null,
            'specialties' => $validated['specialties'] ?? null,
            'service_area' => $validated['service_area'] ?? null,
            'certifications' => $validated['certifications'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->route('search.index')->with('success', 'Your application has been submitted and is pending approval.');
    }
}
