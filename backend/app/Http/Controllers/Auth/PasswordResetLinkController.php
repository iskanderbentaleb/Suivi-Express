<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Loop through all password brokers in config/auth.php
        foreach (config('auth.passwords') as $broker => $settings) {
            $provider = config("auth.providers.{$settings['provider']}.model");

            // Attempt to find the user by email in each provider
            if ($provider && $provider::where('email', $request->email)->exists()) {
                $status = Password::broker($broker)->sendResetLink(
                    $request->only('email')
                );

                if ($status === Password::RESET_LINK_SENT) {
                    return response()->json(['status' => __($status)]);
                } else {
                    throw ValidationException::withMessages([
                        'email' => [__($status)],
                    ]);
                }
            }
        }

        // If no user is found in any provider
        throw ValidationException::withMessages([
            'email' => [__('We can\'t find a user with that email address.')],
        ]);
    }

}
