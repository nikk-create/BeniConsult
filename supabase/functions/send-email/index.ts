// supabase/functions/send-email/index.ts
// Deploy: supabase functions deploy send-email
// Appelé depuis le frontend ou comme trigger DB

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = 'BéniConsult <noreply@beniconsult.bj>'

interface EmailPayload {
  to: string
  subject: string
  html: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendEmail({ to, subject, html }: EmailPayload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  return res.json()
}

// Templates emails
function templateRDVPatient(patientName: string, doctorName: string, date: string, time: string) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:24px;background:#f4f8f5;border-radius:16px;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-flex;height:8px;width:120px;overflow:hidden;border-radius:4px;">
          <div style="width:33%;background:#008751"></div>
          <div style="flex:1;background:#FCD116"></div>
          <div style="flex:1;background:#E8112D"></div>
        </div>
        <h1 style="color:#008751;margin-top:12px;font-size:22px;">BéniConsult</h1>
      </div>
      <div style="background:white;border-radius:12px;padding:20px;">
        <h2 style="color:#111;margin-bottom:8px;">Rendez-vous confirmé ✅</h2>
        <p style="color:#555;">Bonjour <strong>${patientName}</strong>,</p>
        <p style="color:#555;">Votre rendez-vous avec <strong>${doctorName}</strong> est confirmé.</p>
        <div style="background:#e6f5ee;border-radius:8px;padding:12px;margin:16px 0;">
          <p style="margin:0;color:#006640;"><strong>📅 Date :</strong> ${date}</p>
          <p style="margin:4px 0 0;color:#006640;"><strong>🕐 Heure :</strong> ${time}</p>
        </div>
        <p style="color:#555;font-size:13px;">Connectez-vous sur BéniConsult pour rejoindre la consultation.</p>
      </div>
      <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px;">BéniConsult · Cotonou, Bénin 🇧🇯</p>
    </div>
  `
}

function templateApprovalDoctor(doctorName: string, approved: boolean) {
  const color = approved ? '#008751' : '#E8112D'
  const icon = approved ? '✅' : '❌'
  const title = approved ? 'Compte approuvé !' : 'Demande non retenue'
  const msg = approved
    ? 'Félicitations ! Votre compte médecin BéniConsult a été validé. Vous pouvez maintenant vous connecter et commencer à recevoir des consultations.'
    : 'Nous avons examiné votre dossier mais ne pouvons pas l\'approuver pour le moment. Contactez support@beniconsult.bj pour plus d\'informations.'

  return `
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:24px;background:#f4f8f5;border-radius:16px;">
      <h1 style="color:#008751;text-align:center;">BéniConsult</h1>
      <div style="background:white;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">${icon}</div>
        <h2 style="color:${color};">${title}</h2>
        <p style="color:#555;">Bonjour <strong>${doctorName}</strong>,</p>
        <p style="color:#555;">${msg}</p>
        ${approved ? `<a href="https://beniconsult.bj/connexion" style="display:inline-block;background:#008751;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:12px;">Se connecter</a>` : ''}
      </div>
    </div>
  `
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { type, data } = await req.json()
    let result

    switch (type) {
      case 'rdv_confirmed':
        result = await sendEmail({
          to: data.patientEmail,
          subject: `✅ RDV confirmé avec ${data.doctorName} — BéniConsult`,
          html: templateRDVPatient(data.patientName, data.doctorName, data.date, data.time),
        })
        break

      case 'doctor_approved':
        result = await sendEmail({
          to: data.doctorEmail,
          subject: '✅ Votre compte BéniConsult est approuvé !',
          html: templateApprovalDoctor(data.doctorName, true),
        })
        break

      case 'doctor_rejected':
        result = await sendEmail({
          to: data.doctorEmail,
          subject: 'Demande de compte BéniConsult',
          html: templateApprovalDoctor(data.doctorName, false),
        })
        break

      default:
        return new Response(JSON.stringify({ error: 'Type inconnu' }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
