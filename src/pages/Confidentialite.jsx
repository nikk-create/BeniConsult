import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Shield } from 'lucide-react'

export default function Confidentialite() {
  const navigate = useNavigate()
  const date = '22 août 2026'

  return (
    <div className="min-h-dvh bg-background">
      <div className="bg-primary text-white px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="font-heading font-bold text-base">Politique de Confidentialité</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-16">
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">

          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-gray-900">Protection de vos données</p>
              <p className="text-xs text-gray-400">Dernière mise à jour : {date}</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-primary-dark leading-relaxed">
              🔒 BéniConsult accorde une importance primordiale à la protection de vos données personnelles et médicales. Cette politique explique quelles données nous collectons, comment nous les utilisons et vos droits.
            </p>
          </div>

          {[
            {
              title: '1. Responsable du traitement',
              content: `BéniConsult, plateforme de téléconsultation médicale, dont le siège est situé à Cotonou, République du Bénin, est responsable du traitement de vos données personnelles.

Contact DPO : privacy@beniconsult.bj`,
            },
            {
              title: '2. Données collectées',
              content: `Nous collectons les données suivantes :

Données d'identification :
• Nom complet, adresse email, numéro de téléphone
• Ville de résidence

Données médicales (optionnelles, renseignées par le patient) :
• Groupe sanguin, allergies, antécédents médicaux
• Traitements en cours, chirurgies passées

Données de consultation :
• Messages échangés avec les médecins
• Ordonnances émises
• Historique des rendez-vous

Données de paiement :
• Numéro de téléphone mobile money (non stocké en clair)
• Montant et date des transactions`,
            },
            {
              title: '3. Finalités du traitement',
              content: `Vos données sont utilisées pour :
• Créer et gérer votre compte utilisateur
• Mettre en relation patients et médecins
• Assurer le suivi médical et l'historique des consultations
• Traiter les paiements de manière sécurisée
• Améliorer nos services et l'expérience utilisateur
• Vous envoyer des notifications liées à vos consultations`,
            },
            {
              title: '4. Base légale du traitement',
              content: `Le traitement de vos données repose sur :
• Votre consentement explicite lors de l'inscription
• L'exécution du contrat de service entre vous et BéniConsult
• Les obligations légales applicables en République du Bénin
• L'intérêt légitime de BéniConsult pour améliorer ses services`,
            },
            {
              title: '5. Sécurité des données',
              content: `BéniConsult met en œuvre des mesures techniques et organisationnelles pour protéger vos données :
• Chiffrement des données en transit (HTTPS/TLS)
• Stockage sécurisé via Supabase (infrastructure ISO 27001)
• Accès restreint aux données médicales (médecin traitant uniquement)
• Authentification sécurisée avec mots de passe chiffrés (bcrypt)
• Logs d'accès et surveillance continue`,
            },
            {
              title: '6. Partage des données',
              content: `Vos données ne sont jamais vendues à des tiers.

Elles peuvent être partagées uniquement avec :
• Le médecin consultant lors d'une consultation active
• Nos prestataires techniques (Supabase pour l'hébergement)
• Les autorités compétentes en cas d'obligation légale

Les médecins sont soumis au secret médical et s'engagent à ne pas divulguer vos informations.`,
            },
            {
              title: '7. Conservation des données',
              content: `Vos données sont conservées pendant :
• Durée de votre compte actif + 3 ans après suppression
• Données médicales : 10 ans (obligation légale médicale)
• Données de paiement : 5 ans (obligation comptable)

Vous pouvez demander la suppression de votre compte à tout moment.`,
            },
            {
              title: '8. Vos droits',
              content: `Conformément à la réglementation applicable, vous disposez des droits suivants :
• Droit d'accès à vos données personnelles
• Droit de rectification des données inexactes
• Droit à l'effacement (droit à l'oubli)
• Droit à la portabilité de vos données
• Droit d'opposition au traitement
• Droit de retirer votre consentement à tout moment

Pour exercer ces droits, contactez : privacy@beniconsult.bj`,
            },
            {
              title: '9. Cookies',
              content: `BéniConsult utilise uniquement des cookies techniques nécessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de tracking n'est utilisé.`,
            },
            {
              title: '10. Modifications de cette politique',
              content: `Nous pouvons mettre à jour cette politique de confidentialité. Vous serez informé par email en cas de modification substantielle. La date de dernière mise à jour est indiquée en haut de ce document.`,
            },
            {
              title: '11. Contact',
              content: `Pour toute question relative à vos données personnelles :
Email : privacy@beniconsult.bj
Adresse : BéniConsult, Cotonou, République du Bénin`,
            },
          ].map(({ title, content }) => (
            <div key={title} className="mb-6">
              <h2 className="font-heading font-bold text-base text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
