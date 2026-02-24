<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImportLog;
use Illuminate\Http\Request;
use League\Csv\Writer;

class DownloadImportLogController extends Controller
{
    public function download(Request $request, $id)
    {
        $import = ImportLog::findOrFail($id);
        $admin = $request->user();

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $import->admin_id !== $admin->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $csv = Writer::createFromString();
        
        // Entêtes du rapport
        $csv->insertOne(['Rapport d\'importation', 'ID: ' . $import->id]);
        $csv->insertOne(['Fichier', $import->fichier_nom]);
        $csv->insertOne(['Type', $import->type_import]);
        $csv->insertOne(['Date', $import->created_at->format('Y-m-d H:i:s')]);
        $csv->insertOne(['Statut', $import->statut]);
        $csv->insertOne(['Lignes valides', $import->lignes_valides]);
        $csv->insertOne(['Lignes en erreur', $import->lignes_erreur]);
        $csv->insertOne([]);
        
        // Détail des erreurs si existantes
        if ($import->lignes_erreur > 0 && is_array($import->erreurs_details)) {
            $csv->insertOne(['DETAIL DES ERREURS']);
            $csv->insertOne(['Ligne', 'Raison']);
            foreach ($import->erreurs_details as $erreur) {
                // S'assurer que les clés existent avant de les lire (sécurité)
                $ligne = $erreur['ligne'] ?? 'N/A';
                $raison = $erreur['raison'] ?? 'Erreur inconnue';
                $csv->insertOne([$ligne, $raison]);
            }
        } else {
            $csv->insertOne(['Aucune erreur détaillée enregistrée.']);
        }

        $filename = 'rapport_import_' . $import->id . '_' . date('Ymd_His') . '.csv';

        return response($csv->toString(), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
