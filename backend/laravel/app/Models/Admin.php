<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use App\Models\ImportLog;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

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
        'is_active',
        'last_login',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login' => 'datetime',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function importLogs(): HasMany
    {
        return $this->hasMany(ImportLog::class);
    }

    public function isSuperAdmin(): bool
    {
        return true;
    }

    public function isChefDepartement(): bool
    {
        return false;
    }
}
