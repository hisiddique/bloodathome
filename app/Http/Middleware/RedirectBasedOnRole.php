<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return $next($request);
        }

        $user = $request->user();

        // sadmin routes are handled by Filament with admin guard
        $path = $request->path();

        if (str_starts_with($path, 'sadmin') && ! $this->isAdmin($user)) {
            return redirect($this->getRedirectPath($user));
        }

        return $next($request);
    }

    /**
     * Check if the user has an admin role.
     */
    protected function isAdmin(mixed $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'operations_admin', 'finance_admin', 'support_admin']);
    }

    /**
     * Get the redirect path based on user role (for web guard - patients/providers).
     */
    public function getRedirectPath(mixed $user): string
    {
        if ($user->hasRole('provider') || $user->hasRole('patient')) {
            return '/dashboard';
        }

        return '/';
    }
}
