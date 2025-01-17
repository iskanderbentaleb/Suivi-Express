<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Mail extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'sender_id',
        'receiver_id',
        'sender_type',
        'message',
        'is_read',
        'status_id',
        'mail_id',
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function status()
    {
        return $this->belongsTo(MailStatus::class);
    }

    public function replies()
    {
        return $this->hasMany(Mail::class, 'mail_id');
    }

    public function parentMail()
    {
        return $this->belongsTo(Mail::class, 'mail_id');
    }
}
