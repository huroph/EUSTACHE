# 🚀 API Express d'authentification - Référence rapide

## 📁 Structure recommandée du serveur

```
api-filmboard/
├── .env                    # Variables d'environnement
├── app.js                  # Point d'entrée du serveur
├── supabase.js            # Client Supabase
└── routes/
    └── auth.js            # Routes d'authentification
```

## 📄 Fichiers de configuration

### .env
```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production

# Server
PORT=4000
NODE_ENV=development
```

### package.json
```json
{
  "name": "filmboard-api",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "@supabase/supabase-js": "^2.x",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

## 🔧 Fichiers sources

### app.js
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### supabase.js
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### routes/auth.js
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware d'authentification
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // Créer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: full_name || null,
        role: 'editor'
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Générer le token JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: profile,
      access_token: token
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Se connecter avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const userId = authData.user.id;

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Générer le token JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: profile,
      access_token: token
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error) throw error;

    res.json({ user: profile });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

module.exports = router;
```

## 🚀 Commandes

### Installation
```bash
npm install
```

### Démarrage en développement
```bash
npm run dev
```

### Démarrage en production
```bash
npm start
```

## 🧪 Tests avec curl

### Inscription
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Profil (nécessite un token)
```bash
curl -X GET http://localhost:4000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Notes importantes

1. **JWT_SECRET** : Changer en production pour une clé secrète forte
2. **CORS** : Configurer les origines autorisées en production
3. **HTTPS** : Utiliser HTTPS en production
4. **Rate limiting** : Ajouter un rate limiter pour éviter les abus
5. **Validation** : Améliorer la validation des entrées avec un package comme `joi`

## 🔒 Sécurité en production

### Variables d'environnement
- Ne jamais committer `.env`
- Utiliser des outils comme `dotenv-vault` ou services cloud

### CORS
```javascript
app.use(cors({
  origin: ['https://your-production-domain.com'],
  credentials: true
}));
```

### Rate limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite à 100 requêtes par IP
});

app.use('/auth', limiter);
```

### Helmet (sécurité HTTP)
```javascript
const helmet = require('helmet');
app.use(helmet());
```
