<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('push_subscriptions')) {
            return;
        }

        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete(); // Si l'utilisateur est supprimé → on nettoie

            $table->text('endpoint');

            $table->string('public_key', 512)->nullable();
            $table->string('auth_token', 512)->nullable();

            $table->unique(['user_id', 'endpoint'], 'push_user_endpoint_unique');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
