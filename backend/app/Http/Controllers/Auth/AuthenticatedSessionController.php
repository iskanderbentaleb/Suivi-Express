<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schedule;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        // Authenticate the user using the provided credentials
        $request->authenticate();

        $user = null;

        $guards = array_keys(config('auth.guards'));

        foreach ($guards as $guard) {
            $currentGuard = Auth::guard($guard);
            if ($currentGuard->check()) {
                $user = $currentGuard->user();
                break;
            }
        }

        if (!$user) {
            return response()->json(['error' => 'Authentication failed'], 401);
        }

        $request->session()->regenerate();
        $request->session()->regenerateToken();

        // delete expired token every 24H
        Schedule::command('sanctum:prune-expired --hours=24')->daily();

        // set access token
        $accessToken = $user->createToken('access_token', [$user->getRoleAttribute()], now()->addMinutes(30)); // 30 min expiration
        $newRefreshToken = $user->createToken('refresh_token', [$user->getRoleAttribute()] , now()->addWeeks(1)); // one week expirations


        // Retrieve the (token) record // and // update ip adress
        $newTokenRecord = PersonalAccessToken::where('id', $accessToken->accessToken->id )->first();
        $newTokenRecord->update(['ip_address' => $request->ip()]);


        // Retrieve the (token refresh) record // and // update ip adress
        $newRefreshTokenRecord = PersonalAccessToken::where('id', $newRefreshToken->accessToken->id )->first();
        $newRefreshTokenRecord->update(['ip_address' => $request->ip()]);

        return response()->json([
            'user' => $user,
            'token' => $accessToken->plainTextToken ,
            'refresh_token' => $newRefreshToken->plainTextToken
        ]);
    }




    /**
     * Handle a refresh token request.
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'expired_token' => 'required',
            'refresh_token' => 'required'
        ]);

        // get tokens
        $expiredTokenValue = $request->input('expired_token');
        $refreshTokenValue = $request->input('refresh_token');


        // get data from tokens from db
        $expiredToken = PersonalAccessToken::findToken($expiredTokenValue);
        $refreshToken = PersonalAccessToken::findToken($refreshTokenValue);


        // check if exist
        if (!$refreshToken || $refreshToken->name !== 'refresh_token') {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }
        if (!$expiredToken || $expiredToken->name !== 'access_token') {
            return response()->json(['error' => 'Invalid access token'], 401);
        }
        // check if exist



        // ------------------ expired token ---------------------
        // Check if token expired or not // in this case the token is not expired then return the same token
        if ($expiredToken->expires_at > now()) {
            return response()->json([
                'message' => 'Token has not expired yet',
                'token' => $expiredTokenValue,
                'refresh_token' => $refreshTokenValue
            ]);
        }

        // Secure the change token if the same IP address
        if ($expiredToken->ip_address !== $request->ip()) {
            return response()->json(['error' => 'Token used from an unauthorized IP address'], 401);
        }
        // ------------------ expired token ---------------------



        // ------------------ refresh token ---------------------
        // Secure the change token if the same IP address
        if ($refreshToken->ip_address !== $request->ip()) {
            return response()->json(['error' => 'Token used from an unauthorized IP address'], 401);
        }

        // Check if refresh token expired or not
        if ($refreshToken->expires_at < now()) {
            // Get user tokens
            $user = $refreshToken->tokenable;

            // Delete the old refresh token
            $user->tokens()->where('name', 'refresh_token')->delete();
            $newRefreshToken = $user->createToken('refresh_token', [$user->getRoleAttribute()], now()->addWeeks(1));

            // Update IP address for new refresh token
            $newRefreshTokenRecord = PersonalAccessToken::where('id', $newRefreshToken->accessToken->id)->first();
            $newRefreshTokenRecord->update(['ip_address' => $request->ip()]);

            $newRefreshTokenValue = $newRefreshToken->plainTextToken;
        } else {
            // Use the same refresh token if it is not expired
            $newRefreshTokenValue = $refreshTokenValue;
        }
        // ------------------ refresh token ---------------------





        // Get user tokens
        $user = $refreshToken->tokenable;

        // Delete the old access token
        $user->tokens()->where('name', 'access_token')->delete();

        // Create a new access token with user roles
        $accessToken = $user->createToken('access_token', [$user->getRoleAttribute()], now()->addMinutes(30));

        // Update IP address for the new access token
        $newTokenRecord = PersonalAccessToken::where('id', $accessToken->accessToken->id)->first();
        $newTokenRecord->update(['ip_address' => $request->ip()]);

        return response()->json([
            'token' => $accessToken->plainTextToken,
            'refresh_token' => $newRefreshTokenValue
        ]);
    }



    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
        // Logout from the 'web' guard
        Auth::guard('web')->logout();

        $user = null;

        $guards = array_keys(config('auth.guards'));

        foreach ($guards as $guard) {
            $currentGuard = Auth::guard($guard);
            if ($currentGuard->check()) {
                $user = $currentGuard->user();
                break;
            }
        }

        if ($user) {
            $user->tokens()->delete();
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout succeeded'
        ], 200);
    }
}
