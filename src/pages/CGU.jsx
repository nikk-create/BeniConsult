import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function CGU() {
  const navigate = useNavigate()
  const date = '22 août 2026'

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="font-heading font-bold text-base">Conditions Générales d'Utilisation</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-16">
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 prose prose-sm max-w-none">

          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <div className="flex h-6 w-4 rounded overflow-hidden shrink-0">
              <div className="w-1/3 bg-primary" />
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-secondary" />
                <div className="flex-1 bg-accent" />
              </div>
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-gray-900">BéniConsult</p>
              <p className="text-xs text-gray-400">Dernière mise à jour : {date}</p>
            </div>
          </div>

          {[
            {
              title: '1. Présentation du service',
              content: `BéniConsult est une plateforme de téléconsultation médicale en ligne, exploitée depuis Cotonou, République du Bénin. Elle met en relation des patients avec des médecins et professionnels de santé certifiés, via des consultations par chat ou vidéo.

BéniConsult n'est pas un service d'urgence médicale. En cas d'urgence vitale, appelez immédiatement le SAMU ou les services d'urgence locaux.`,
            },
            {
              title: '2. Acceptation des conditions',
              content: `L'utilisation de la plateforme BéniConsult implique l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.

Ces CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés des modifications importantes.`,
            },
            {
              title: '3. Inscription et compte utilisateur',
              content: `Pour utiliser BéniConsult, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants de connexion.

Les médecins inscrits sur la plateforme doivent fournir leurs diplômes et justificatifs d'exercice. Chaque dossier médecin est vérifié par l'équipe BéniConsult avant toute activation du compte.`,
            },
            {
              title: '4. Nature des consultations',
              content: `Les consultations proposées sur BéniConsult sont des téléconsultations médicales. Elles ne remplacent pas une consultation physique lorsque celle-ci est médicalement nécessaire.

Les médecins sur BéniConsult exercent sous leur propre responsabilité professionnelle. BéniConsult agit en tant qu'intermédiaire technique et ne saurait être tenu responsable des actes médicaux.`,
            },
            {
              title: '5. Tarifs et paiements',
              content: `Le tarif de chaque consultation est fixé par le médecin et affiché clairement avant toute réservation. Le paiement est effectué via les solutions de mobile money disponibles au Bénin (MTN MoMo, Moov Money) ou par carte bancaire.

Aucun remboursement ne sera effectué pour une consultation déjà réalisée. En cas d'annulation avant la consultation, contactez le support.`,
            },
            {
              title: '6. Obligations des utilisateurs',
              content: `Les utilisateurs s'engagent à :
• Fournir des informations exactes lors de l'inscription
• Ne pas usurper l'identité d'un professionnel de santé
• Utiliser la plateforme de manière respectueuse et légale
• Ne pas partager leurs identifiants de connexion
• Signaler tout comportement inapproprié à support@beniconsult.bj`,
            },
            {
              title: '7. Propriété intellectuelle',
              content: `L'ensemble du contenu de BéniConsult (logo, interface, textes, fonctionnalités) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.`,
            },
            {
              title: '8. Limitation de responsabilité',
              content: `BéniConsult ne peut être tenu responsable :
• Des actes médicaux des praticiens inscrits
• D'une interruption temporaire du service
• De dommages indirects liés à l'utilisation de la plateforme
• Des informations médicales erronées fournies par l'utilisateur`,
            },
            {
              title: '9. Droit applicable',
              content: `Les présentes CGU sont régies par le droit béninois. Tout litige sera soumis à la juridiction compétente de Cotonou, Bénin.`,
            },
            {
              title: '10. Contact',
              content: `Pour toute question relative aux présentes CGU, contactez-nous à :
Email : support@beniconsult.bj
Adresse : Cotonou, République du Bénin`,
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
