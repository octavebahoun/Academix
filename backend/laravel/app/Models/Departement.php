<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Departement extends Model
{
    protected $fillable = [
        'nom',
        'code',
        'description',
    ];

    public function filieres(): HasMany
    {
        return $this->hasMany(Filiere::class);
    }

    public function admins(): HasMany
    {
        return $this->hasMany(Admin::class);
    }

    public function statistiques(): HasMany
    {
        return $this->hasMany(StatistiqueDepartement::class);
    }
}
