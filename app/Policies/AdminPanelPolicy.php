<?php

namespace App\Policies;

use App\Models\User;
use Filament\Panel;

class AdminPanelPolicy
{
    /**
     * Determine if the user can view the Filament panel.
     */
    public function viewPanel(User $user, Panel $panel): bool
    {
        if ($panel->getId() === 'admin') {
            return $user->isAdmin();
        }

        return false;
    }
}
