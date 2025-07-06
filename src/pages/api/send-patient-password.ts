import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
// Debug temporaire :
if (!process.env.RESEND_API_KEY) {
  // eslint-disable-next-line no-console
  console.error('RESEND_API_KEY is not defined');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Cabinet Médical <cabinet.unityfianar.com>', // Doit être un domaine validé chez Resend
      to: [email],
      subject: 'Votre accès à Cabinet Médical',
      html: `<p>Bonjour,</p>
        <p>Votre compte a été créé. Voici votre mot de passe temporaire :</p>
        <p><b>${password}</b></p>
        <p>Merci de le changer après votre première connexion.</p>
        <p>Cordialement,<br/>L'équipe Cabinet Médical</p>`
    });

    if (error) {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email', error });
    }

    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email', error: err?.message });
  }
}