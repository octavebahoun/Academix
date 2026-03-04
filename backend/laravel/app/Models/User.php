<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'photo',
        'filiere_id',
        'annee_admission',
        'objectif_moyenne',
        'style_apprentissage',
        'is_active',
        'email_verified_at',
        'last_login',
        'google_access_token',
        'google_refresh_token',
        'google_id',
        'google_calendar_id',
        'google_task_list_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_access_token',
        'google_refresh_token',
    ];

    protected $casts = [
        'objectif_moyenne' => 'decimal:2',
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
        'last_login' => 'datetime',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        return $this->photo;
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function taches(): HasMany
    {
        return $this->hasMany(Tache::class);
    }

    public function alertes(): HasMany
    {
        return $this->hasMany(Alerte::class);
    }
}
