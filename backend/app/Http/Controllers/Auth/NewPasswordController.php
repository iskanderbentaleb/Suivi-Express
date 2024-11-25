<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class NewPasswordController extends Controller
{
    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Loop through all password brokers in config/auth.php
        foreach (config('auth.passwords') as $broker => $settings) {
            $provider = config("auth.providers.{$settings['provider']}.model");

            // Attempt to find the user by email in each provider
            if ($provider && $provider::where('email', $request->email)->exists()) {
                $status = Password::broker($broker)->reset(
                    $request->only('email', 'password', 'password_confirmation', 'token'),
                    function ($user) use ($request) {
                        $user->forceFill([
                            'password' => Hash::make($request->string('password')),
                            'remember_token' => Str::random(60),
                        ])->save();

                        event(new PasswordReset($user));
                    }
                );

                if ($status == Password::PASSWORD_RESET) {
                    return response()->json(['status' => __($status)]);
                } else {
                    throw ValidationException::withMessages([
                        'email' => [__($status)],
                    ]);
                }
            }
        }

        // If no user is found with the given email or token
        throw ValidationException::withMessages([
            'email' => [__('We can\'t find a user with that email address.')],
        ]);
    }
}
