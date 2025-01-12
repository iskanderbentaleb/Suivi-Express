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
        'status_order_id',
        'agent_id',
        'user_id_validator',
        'order_id',
        'history_judge',
    ];

    // Relationship with Reason model
    public function reason()
    {
        return $this->belongsTo(Reason::class, 'reason_id');
    }

    public function status()
    {
        return $this->belongsTo(StatusOrder::class, 'status_order_id');
    }

    // Relationship with Agent model
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    // Relationship with admin (user) model
    public function admin()
    {
        return $this->belongsTo(User::class, foreignKey: 'user_id_validator');
    }

    // Relationship with Order model
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
