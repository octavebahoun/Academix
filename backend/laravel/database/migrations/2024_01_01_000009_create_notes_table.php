<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->decimal('note', 5, 2);
            $table->decimal('note_max', 5, 2)->default(20.00);
            $table->enum('type_evaluation', ['Devoir', 'Partiel', 'TP', 'Projet', 'Examen']);
            $table->integer('coefficient')->default(1);
            $table->date('date_evaluation');
            $table->enum('semestre', ['S1', 'S2']);
            $table->string('annee_academique', 20);
            $table->foreignId('import_id')->nullable()->constrained('import_logs')->onDelete('set null');
            $table->foreignId('created_by_admin_id')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['user_id', 'matiere_id', 'semestre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
