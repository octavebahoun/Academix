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
        'created_by',   
    ];

    public function filieres(): HasMany
    {
        return $this->hasMany(Filiere::class);
    }

    public function chefs(): HasMany
    {
        return $this->hasMany(ChefDepartement::class);
    }

    public function statistiques(): HasMany
    {
        return $this->hasMany(StatistiqueDepartement::class);
    }
}
