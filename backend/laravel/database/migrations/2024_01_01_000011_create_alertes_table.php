<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type_alerte', ['moyenne_faible', 'deadline_proche', 'note_faible', 'absence']);
            $table->enum('niveau_severite', ['faible', 'moyen', 'eleve']);
            $table->string('titre');
            $table->text('message');
            $table->json('actions_suggerees')->nullable();
            $table->boolean('est_lue')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'est_lue']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
