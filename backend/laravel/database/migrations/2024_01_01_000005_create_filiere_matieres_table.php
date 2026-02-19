<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filiere_matieres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('filiere_id')->constrained()->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->enum('semestre', ['S1', 'S2']);
            
            $table->unique(['filiere_id', 'matiere_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filiere_matieres');
    }
};
