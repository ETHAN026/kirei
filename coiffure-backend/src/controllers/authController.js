const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, nom: admin.nom },
  });
}

async function me(req, res) {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    select: { id: true, email: true, nom: true, createdAt: true },
  });
  res.json(admin);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
  }

  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

  res.json({ message: 'Mot de passe mis à jour.' });
}

module.exports = { login, me, changePassword };
