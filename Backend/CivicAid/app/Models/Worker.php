<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;


class Worker extends Model implements Authenticatable
{
    use HasFactory, AuthenticatableTrait;
    
    protected $primaryKey = 'workerId';

    public function user()
    {
        
        return $this->belongsTo(User::class);
    }
}
