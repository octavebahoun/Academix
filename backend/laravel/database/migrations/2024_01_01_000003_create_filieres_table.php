<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filieres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departement_id')->constrained()->onDelete('cascade');
            $table->string('nom', 100);
            $table->enum('niveau', ['L1', 'L2', 'L3', 'M1', 'M2']);
            $table->string('code', 20)->unique();
            $table->string('annee_academique', 20);
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['departement_id', 'niveau']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filieres');
    }
};
