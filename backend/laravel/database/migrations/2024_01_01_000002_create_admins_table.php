<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telephone', 20)->nullable();
            $table->string('photo')->nullable();
            $table->enum('role', ['super_admin', 'chef_departement']);
            $table->foreignId('departement_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login')->nullable();
            $table->timestamps();
            
            $table->index(['email', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
