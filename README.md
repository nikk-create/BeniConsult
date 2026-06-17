# BéniConsult 🇧🇯
Plateforme de consultation médicale en ligne — Bénin

## Stack
- **Frontend** : React + Vite + Tailwind CSS + Framer Motion
- **Backend/BDD** : Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Emails** : Resend (via Supabase Edge Functions)
- **Vidéo** : Jitsi Meet (gratuit, sans backend)
- **PDF** : jsPDF (côté client)

---

## 🚀 Installation en 5 étapes

### 1. Cloner et installer
```bash
git clone <ton-repo>
cd beniconsult
npm install
```

### 2. Créer le projet Supabase
1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Nom : `beniconsult` · Région : **Europe West** (le plus proche du Bénin)
3. Note ton **Project URL** et ta **anon key** (Settings > API)

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Remplis `.env` avec tes vraies clés Supabase.

### 4. Initialiser la base de données
1. Supabase > **SQL Editor**
2. Copie-colle le contenu de `supabase/migrations/001_init.sql`
3. Clique **Run**

### 5. Créer le compte admin
Dans Supabase > **Authentication > Users** :
1. Clique **Add user** → entre `admin@beniconsult.bj` + mot de passe
2. Copie l'UUID généré
3. Dans SQL Editor :
```sql
INSERT INTO public.profiles (id, full_name, email, role)
VALUES ('COLLE-UUID-ICI', 'Admin BéniConsult', 'admin@beniconsult.bj', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Lancer le projet
```bash
npm run dev
# → http://localhost:5173
```

---

## 👤 Connexion par rôle

| Rôle | Onglet | Accès après login |
|------|--------|-------------------|
| Patient | Patient | `/accueil` |
| Médecin | Médecin | `/medecin/dashboard` (si approuvé) |
| Admin | Administrateur | `/admin/dashboard` |

### Flux d'approbation médecin
1. Le médecin s'inscrit via l'onglet **Médecin > Inscription**
2. Son statut est `en_attente` — il voit un écran d'attente
3. L'admin va dans **Admin > Médecins** et clique **Approuver**
4. Une notification est envoyée au médecin
5. Il peut maintenant se connecter et accéder au dashboard

---

## 📁 Structure des fichiers

```
beniconsult/
├── src/
│   ├── api/
│   │   └── supabase.js           ← client Supabase
│   ├── hooks/
│   │   ├── useAuth.jsx           ← contexte auth + profil + rôle
│   │   ├── useMessages.js        ← chat realtime
│   │   └── useNotifications.js   ← notifs realtime
│   ├── components/
│   │   ├── Layout.jsx            ← layout patient
│   │   ├── DoctorLayout.jsx      ← layout médecin
│   │   ├── AdminLayout.jsx       ← layout admin
│   │   ├── NotificationBell.jsx
│   │   ├── DoctorCard.jsx
│   │   └── AppointmentCard.jsx
│   ├── pages/
│   │   ├── Login.jsx             ← 3 onglets patient/médecin/admin
│   │   ├── Home.jsx
│   │   ├── Doctors.jsx
│   │   ├── DoctorProfile.jsx
│   │   ├── Appointments.jsx
│   │   ├── Messages.jsx
│   │   ├── Chat.jsx              ← chat realtime Supabase
│   │   ├── VideoCall.jsx         ← Jitsi Meet
│   │   ├── Payment.jsx           ← MTN MoMo / Moov mock
│   │   ├── Payments.jsx
│   │   ├── Profile.jsx
│   │   ├── DossierMedical.jsx
│   │   ├── PrescriptionView.jsx  ← + export PDF
│   │   ├── doctor/
│   │   │   ├── DoctorHome.jsx
│   │   │   ├── DoctorAgenda.jsx
│   │   │   ├── DoctorMessages.jsx
│   │   │   ├── DoctorProfil.jsx
│   │   │   ├── WritePrescription.jsx
│   │   │   └── PatientRecord.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminDoctors.jsx  ← approbation médecins ⭐
│   │       ├── AdminAppointments.jsx
│   │       ├── AdminPatients.jsx
│   │       └── AdminPayments.jsx
│   ├── App.jsx                   ← router + protection routes
│   ├── main.jsx
│   └── index.css
├── supabase/
│   ├── migrations/
│   │   └── 001_init.sql          ← toutes les tables + RLS
│   └── functions/
│       └── send-email/
│           └── index.ts          ← emails via Resend
├── .env.example
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔧 Supabase Realtime — Activation

Dans Supabase > **Database > Replication** :
- Active `messages` ✅
- Active `notifications` ✅

---

## 📧 Déployer les emails Resend (optionnel)

```bash
# Installer Supabase CLI
npm install -g supabase

# Lier ton projet
supabase login
supabase link --project-ref TON-PROJECT-REF

# Ajouter la clé Resend
supabase secrets set RESEND_API_KEY=re_xxxx

# Déployer la fonction
supabase functions deploy send-email
```

Puis dans AdminDoctors.jsx, appelle l'email après approbation :
```js
await supabase.functions.invoke('send-email', {
  body: {
    type: 'doctor_approved',
    data: { doctorEmail: doc.email, doctorName: doc.full_name }
  }
})
```

---

## 🌐 Déploiement sur Netlify

```bash
npm run build
# Déploie le dossier /dist sur Netlify
```

Dans Netlify > Site settings > Build & deploy :
- **Build command** : `npm run build`
- **Publish directory** : `dist`
- **Variables d'env** : copie ton `.env`

Ajoute un fichier `public/_redirects` :
```
/*  /index.html  200
```

---

## 💡 Ajouter un vrai paiement Mobile Money

Pour intégrer MTN MoMo Bénin réellement :
1. Crée un compte développeur sur [momodeveloper.mtn.com](https://momodeveloper.mtn.com)
2. Utilise l'API **Collections** pour débiter un numéro
3. Remplace la simulation dans `Payment.jsx` par un appel à une Supabase Edge Function qui appelle l'API MTN

---

## 🛠️ Commandes utiles

```bash
npm run dev       # Développement local
npm run build     # Build production
npm run preview   # Prévisualiser le build

# Supabase local (optionnel)
supabase start    # Lance Supabase localement
supabase db diff  # Voir les changements de schéma
supabase db push  # Pousser les migrations
```

---

## 📞 Support

**Email** : support@beniconsult.bj  
**Développeur** : BéniConsult Team · Cotonou, Bénin 🇧🇯
