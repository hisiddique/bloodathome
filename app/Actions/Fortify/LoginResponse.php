<?php

namespace App\Actions\Fortify;

use App\Http\Middleware\RedirectBasedOnRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        // If user is an admin, log them out and redirect to admin login
        if ($this->isAdmin($user)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/sadmin/login')
                ->with('status', 'Please use the admin login page.');
        }

        $redirectPath = (new RedirectBasedOnRole)->getRedirectPath($user);

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended($redirectPath);
    }

    /**
     * Check if the user has an admin role.
     */
    protected function isAdmin(mixed $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'operations_admin', 'finance_admin', 'support_admin']);
    }
}
