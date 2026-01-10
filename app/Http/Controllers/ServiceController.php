<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of all active services (blood tests).
     */
    public function index(): Response
    {
        $services = Service::query()
            ->with('category')
            ->active()
            ->orderBy('service_name')
            ->get()
            ->groupBy('category.category_name');

        return Inertia::render('services/index', [
            'services' => $services,
        ]);
    }
}
