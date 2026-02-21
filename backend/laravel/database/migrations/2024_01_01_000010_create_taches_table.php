<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('taches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->foreignId('matiere_id')->nullable()->constrained()->onDelete('set null');
            $table->dateTime('date_limite');
            $table->enum('priorite', ['basse', 'moyenne', 'haute'])->default('moyenne');
            $table->enum('statut', ['a_faire', 'en_cours', 'terminee'])->default('a_faire');
            $table->timestamps();

            $table->index(['user_id', 'statut', 'date_limite']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taches');
    }
};
