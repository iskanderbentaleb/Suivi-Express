<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'tracking',
        'external_id',
        'client_name',
        'client_lastname',
        'phone',
        'created_by',
        'affected_to',
        'status_id',
        'delivery_company_id',
        'product_url',
        'archive',
    ];

    /**
     * Get the user who created the order.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the agent to whom the order is assigned.
     */
    public function affectedTo()
    {
        return $this->belongsTo(Agent::class, 'affected_to');
    }

    /**
     * Get the status of the order.
     */
    public function status()
    {
        return $this->belongsTo(StatusOrder::class, 'status_id');
    }

    public function historyOrders()
    {
        return $this->hasMany(HistoryOrders::class, 'order_id');
    }

    /**
     * Get the delivery company associated with the order.
     */
    public function deliveryCompany()
    {
        return $this->belongsTo(DeliveryCompany::class, 'delivery_company_id');
    }

}
