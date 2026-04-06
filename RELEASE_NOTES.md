# Release Notes v0.1.0

## ⚠️ Avertissement important : Binaires non signés

Les binaires de cette version v0.1.0 ne sont pas signés numériquement. C'est une décision intentionnelle pour la release initiale.

### Pourquoi pas de signature

| Raison             | Explication                                                        |
| ------------------ | ------------------------------------------------------------------ |
| **Simplification** | Première release MVP, focus sur la validation produit              |
| **Coût**           | Certificat Apple Developer ($99/an), certificat Windows EV (>$200) |
| **Timeline**       | Processus de validation Apple/Microsoft peut prendre des semaines  |
| **Priorité**       | Fonctionnalités > packaging pour v0.1.0                            |

### Statut des signatures par plateforme

| Plateforme  | Format           | Signé  | Impact utilisateur        |
| ----------- | ---------------- | ------ | ------------------------- |
| **macOS**   | .dmg             | ❌ Non | Avertissement Gatekeeper  |
| **Windows** | .msi / .exe      | ❌ Non | Avertissement SmartScreen |
| **Linux**   | .AppImage / .deb | N/A    | Aucun impact              |

### Instructions d'installation

#### 🍎 macOS

**Problème:** macOS affiche "Rune API Client ne peut pas être ouvert car il provient d'un développeur non identifié"

**Solution:**

```bash
# Méthode 1: Via Terminal (recommandée)
sudo xattr -cr /Applications/Rune-API-Client.app

# Méthode 2: Via GUI
# 1. Clic droit sur l'application → Ouvrir
# 2. Cliquer "Ouvrir" dans la boîte de dialogue
```

#### 🪟 Windows

**Problème:** Windows Defender SmartScreen bloque l'exécution

**Solution:**

1. Clic droit sur le fichier .exe ou .msi
2. Sélectionner "Propriétés"
3. Cocher "Débloquer" en bas de la fenêtre
4. Cliquer "OK"
5. Relancer l'installation

**Alternative:**

Lors de l'avertissement SmartScreen :

- Cliquer sur **"Plus d'infos"**
- Cliquer sur **"Exécuter quand même"**

#### 🐧 Linux

Aucune action requise. Les formats AppImage et deb n'ont pas de restrictions de signature.

```bash
# AppImage
chmod +x Rune-API-Client_0.1.0_amd64.AppImage
./Rune-API-Client_0.1.0_amd64.AppImage

# deb
sudo dpkg -i rune-api-client_0.1.0_amd64.deb
# ou
cd rune-api-client_0.1.0_amd64.deb
```

### FAQ

**Q: Est-ce que les binaires non signés sont dangereux ?**
R: Non, ils sont identiques aux versions signées. Seule la vérification de l'éditeur manque.

**Q: Pourquoi ne pas attendre d'avoir les certificats ?**
R: La v0.1.0 est une release MVP pour valider l'intérêt du produit. Les certificats seront ajoutés en v0.2.0.

**Q: Comment vérifier l'intégrité des binaires ?**
R: Les checksums SHA-256 sont fournis avec chaque release pour vérification manuelle.

**Q: Quand les binaires seront-ils signés ?**
R: La v0.2.0 inclura des binaires signés avec certificats officiels Apple et Microsoft.

### Roadmap codesigning

- [x] v0.1.0 - Release initiale sans signature
- [ ] v0.2.0 - Ajout codesigning macOS (Apple Developer ID)
- [ ] v0.2.0 - Ajout codesigning Windows (EV Code Signing)
- [ ] v0.3.0 - Notarization macOS complète

### Vérification de sécurité

Même sans signature, les binaires sont :

- ✅ Compilés depuis le code source public sur GitHub
- ✅ Vérifiés par cargo audit (pas de vulnérabilités connues)
- ✅ Testés sur les 3 plateformes avant release
- ✅ Checksums SHA-256 publiés pour vérification

### Support

Si vous rencontrez des problèmes d'installation :

- 📧 Email: [Votre email]
- 🐛 Issues: [GitHub Issues](https://github.com/bensaadmucret/Rune-API-Client/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/bensaadmucret/Rune-API-Client/discussions)
