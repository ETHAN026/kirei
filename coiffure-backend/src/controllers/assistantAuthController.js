const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const assistant = await prisma.assistant.findUnique({ where: { email } });
  if (!assistant || !assistant.actif) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const valid = await bcrypt.compare(password, assistant.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const token = jwt.sign(
    { id: assistant.id, email: assistant.email, role: 'assistant' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    assistant: { id: assistant.id, nom: assistant.nom, prenom: assistant.prenom, email: assistant.email },
  });
}

async function me(req, res) {
  const assistant = await prisma.assistant.findUnique({
    where: { id: req.assistant.id },
    select: { id: true, nom: true, prenom: true, email: true, telephone: true, createdAt: true },
  });
  if (!assistant) return res.status(404).json({ error: 'Assistant introuvable.' });
  res.json(assistant);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
  }

  const assistant = await prisma.assistant.findUnique({ where: { id: req.assistant.id } });
  const valid = await bcrypt.compare(currentPassword, assistant.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.assistant.update({ where: { id: assistant.id }, data: { passwordHash } });

  res.json({ message: 'Mot de passe mis à jour.' });
}

module.exports = { login, me, changePassword };
