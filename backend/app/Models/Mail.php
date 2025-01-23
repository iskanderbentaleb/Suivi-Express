<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Mail extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'sender_agent_id',
        'receiver_agent_id',
        'sender_admin_id',
        'receiver_admin_id',
        'message',
        'is_read',
        'status_id',
        'mail_id',
    ];

    /**
     * Get the order associated with the mail.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the sender agent (if any).
     */
    public function senderAgent()
    {
        return $this->belongsTo(Agent::class, 'sender_agent_id');
    }

    /**
     * Get the receiver agent (if any).
     */
    public function receiverAgent()
    {
        return $this->belongsTo(Agent::class, 'receiver_agent_id');
    }

    /**
     * Get the sender admin (if any).
     */
    public function senderAdmin()
    {
        return $this->belongsTo(User::class, 'sender_admin_id');
    }

    /**
     * Get the receiver admin (if any).
     */
    public function receiverAdmin()
    {
        return $this->belongsTo(User::class, 'receiver_admin_id');
    }

    /**
     * Get the status of the mail.
     */
    public function status()
    {
        return $this->belongsTo(MailStatus::class, 'status_id');
    }

    /**
     * Get the parent mail (if this is a reply).
     */
    public function parentMail()
    {
        return $this->belongsTo(Mail::class, 'mail_id');
    }

    /**
     * Get the replies to this mail.
     */
    public function replies()
    {
        return $this->hasMany(Mail::class, 'mail_id');
    }
}
