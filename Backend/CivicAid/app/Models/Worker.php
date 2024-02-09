<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;
// use Illuminate\Auth\Authenticatable as AuthenticableTrait;

// class Worker extends Model
// {
//     use HasFactory, AuthenticableTrait;
//     protected $primaryKey = 'workerId';

//     public function user()
//     {
        
//         return $this->belongsTo(User::class);
//     }
// }



use Illuminate\Foundation\Auth\Worker as Authenticatable;

class Worker extends Authenticatable
{
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];
}

