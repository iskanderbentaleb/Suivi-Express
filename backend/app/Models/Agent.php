<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Agent extends Authenticatable
{
    //
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;


    protected $appends = ['role'];
    public function getRoleAttribute(){
        return 'agent';
    }


    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


    public function orders()
    {
        return $this->hasMany(Order::class , 'affected_to');
    }

        /**
     * Get the mails sent by this agent.
     */
    public function sentMails()
    {
        return $this->hasMany(Mail::class, 'sender_agent_id');
    }

    /**
     * Get the mails received by this agent.
     */
    public function receivedMails()
    {
        return $this->hasMany(Mail::class, 'receiver_agent_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
