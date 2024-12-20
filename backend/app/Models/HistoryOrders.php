<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistoryOrders extends Model
{
    use HasFactory;

    // The fillable attributes
    protected $fillable = [
        'note',
        'timetook',
        'reason_id',
        'agent_id',
        'order_id',
    ];

    // Relationship with Reason model
    public function reason()
    {
        return $this->belongsTo(Reason::class, 'reason_id');
    }

    // Relationship with Agent model
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    // Relationship with Order model
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
