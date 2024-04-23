<?php

namespace App\Models;

use Illuminate\Foundation\Auth\Worker as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Worker extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    // protected $primaryKey = 'id';
    // public $incrementing = false;
    public function applications()
    {
        return $this->belongsToMany(Application::class, 'assignments', 'workerId', 'applicationId');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'dni',
        'name',
        'surname',
        'secondSurname',
        'sector',
        'assignedLocation',
        'assignedApplications',
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

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        // 'id' => 'string',
    ];

    
}

