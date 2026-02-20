<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Admin extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'super_admins';
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'photo',
        'departement_id', 
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
        'remember_token',
    ];



    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }

    public function importLogs(): HasMany
    {
        return $this->hasMany(ImportLog::class);
    }

    public function isSuperAdmin(): bool
    {
        return is_null($this->departement_id);
    }

    public function isChefDepartement(): bool
    {
        return !is_null($this->departement_id);
    }
}
