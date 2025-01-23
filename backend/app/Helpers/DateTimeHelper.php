<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateTimeHelper
{
    /**
     * Format a timestamp in French.
     *
     * @param Carbon $timestamp
     * @return string
     */
    public static function formatTimestampInFrench(Carbon $timestamp): string
    {
        $now = Carbon::now();

        // Set locale to French
        Carbon::setLocale('fr');

        // Determine the formatted date
        if ($timestamp->isToday()) {
            return "Aujourd'hui à " . $timestamp->format('H:i');
        } elseif ($timestamp->isYesterday()) {
            return "Hier à " . $timestamp->format('H:i');
        } elseif ($timestamp->greaterThan($now->subWeek())) {
            return $timestamp->translatedFormat('l \à H:i'); // Day of the week with time in French
        } else {
            return $timestamp->format('d/m/Y H:i'); // Default format for older dates
        }
    }
}
