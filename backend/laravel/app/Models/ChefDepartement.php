<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChefDepartement extends Authenticatable
{

    use HasApiTokens;

    protected $table = 'chefs_departement';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'photo',
        'departement_id',      
        'created_by_admin',    
        'is_active',
        'last_login',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login' => 'datetime',
        'departement_id' => 'integer',
    ];

    protected $hidden = [
        'password',
    ];

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class, 'departement_id');
    }

    public function createdByAdmin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by_admin');
    }

    public function isSuperAdmin(): bool
    {
        return false;
    }

    public function isChefDepartement(): bool
    {
        return true;
    }
}
