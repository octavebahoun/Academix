<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alerte extends Model
{
    protected $fillable = [
        'user_id',
        'type_alerte',
        'niveau_severite',
        'titre',
        'message',
        'actions_suggerees',
        'est_lue',
    ];

    protected $casts = [
        'actions_suggerees' => 'array',
        'est_lue' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
