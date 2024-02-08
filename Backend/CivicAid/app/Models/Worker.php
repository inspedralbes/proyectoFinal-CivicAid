<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class Worker extends Authenticatable
{
    use Notifiable, HasApiTokens;

    protected $primaryKey = 'workerId';

    public function user()
    {
        
        return $this->belongsTo(Worker::class);
    }
}



