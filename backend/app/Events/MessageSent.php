<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $mail;

    public function __construct($mail)
    {
        $this->mail = $mail;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('chat'); // Ensure private or public matches
    }

    public function broadcastAs()
    {
        return 'MessageSent';
    }
}

