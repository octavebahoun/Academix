import { motion } from "framer-motion";
import LandingNavbar from "../components/landing/LandingNavbar";
import Footer from "../components/landing/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <LandingNavbar />
      
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-8 tracking-tight">
            Politique de <span className="text-emerald-400 font-display italic">Confidentialité</span>
          </h1>
          
          <div className="prose prose-invert prose-emerald max-w-none space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2 mb-4">1. Introduction</h2>
              <p>
                Chez AcademiX, la confidentialité et la sécurité de vos données personnelles sont au cœur de nos préoccupations. 
                Cette politique détaille comment nous collectons, utilisons et protégeons vos informations dans le cadre de l'utilisation 
                de notre plateforme académique.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2 mb-4">2. Collecte des Données</h2>
              <p>Nous collectons les informations suivantes pour assurer le bon fonctionnement du service :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informations de Profil :</strong> Nom, prénom, email, établissement, filière et photo de profil.</li>
                <li><strong>Données Académiques :</strong> Notes, coefficients, emplois du temps et tâches à accomplir.</li>
                <li><strong>Contenus d'Apprentissage :</strong> Supports de cours uploadés pour le traitement par IA.</li>
                <li><strong>Données de Session :</strong> Logs de présence et messages dans les sessions de collaboration.</li>
              </ul>
            </section>

            <section className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">3. Utilisation de l'Intelligence Artificielle</h2>
              <p>
                AcademiX utilise des modèles de langage (LLM) avancés via Groq, OpenRouter et HuggingFace.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Vos documents sont transmis de manière sécurisée et éphémère à nos services IA pour générer des résumés, quiz et podcasts.</li>
                <li><strong>Confidentialité RAG :</strong> Les réponses du "Prof IA" sont limitées au contexte de vos propres documents.</li>
                <li>Nous ne vendons jamais vos données de cours à des tiers pour l'entraînement de modèles globaux.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2 mb-4">4. Sécurité des Données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité rigoureuses :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement SSL/TLS pour tous les échanges de données.</li>
                <li>Authentification sécurisée via Laravel Sanctum.</li>
                <li>Isolation des bases de données par environnement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2 mb-4">5. Vos Droits</h2>
              <p>
                Conformément aux lois en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. 
                Vous pouvez exercer ces droits directement depuis votre profil ou en contactant notre support technique.
              </p>
            </section>

            <section className="text-sm text-slate-500 pt-10">
              Dernière mise à jour : 04 Mars 2026<br />
              Pour toute question : <a href="mailto:privacy@academix.app" className="text-emerald-400 hover:underline">privacy@academix.app</a>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
