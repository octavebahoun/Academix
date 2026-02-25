import hashlib
import aiomysql
from fastapi import Header, HTTPException, Depends, status
from app.core.config import settings

# Mapping des types Sanctum vers les tables et rôles
MODEL_MAP = {
    'App\\Models\\Admin': {
        'table': 'super_admins',
        'role': 'super_admin',
        'fields': 'id, nom, prenom, email'
    },
    'App\\Models\\ChefDepartement': {
        'table': 'chefs_departement',
        'role': 'chef_departement',
        'fields': 'id, nom, prenom, email, departement_id'
    },
    'App\\Models\\User': {
        'table': 'users',
        'role': 'student',
        'fields': 'id, nom, prenom, email'
    }
}

# Pool de connexion partagé (singleton)
_db_pool = None

async def get_db_pool():
    """Crée ou réutilise un pool de connexion MySQL asynchrone (singleton)."""
    global _db_pool
    if _db_pool is not None and not _db_pool._closed:
        return _db_pool
    try:
        _db_pool = await aiomysql.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME,
            autocommit=True,
            minsize=1,
            maxsize=10
        )
        return _db_pool
    except Exception as e:
        print(f"Erreur de connexion MySQL : {e}")
        return None

async def get_current_user(authorization: str = Header(None)):
    """
    Vérifie le token Sanctum de Laravel dans la base MySQL.
    """
    if not authorization or not authorization.startswith("Bearer "):
        print(f"DEBUG AUTH: Header Authorization manquant ou invalide. Reçu: {authorization}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'authentification manquant ou invalide"
        )

    token_str = authorization.replace("Bearer ", "")
    
    # Format Sanctum : "{id}|{plain_text_token}"
    if "|" not in token_str:
        print(f"DEBUG AUTH: Format de token invalide (pas de |). Token: {token_str}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format de token invalide"
        )

    token_id, plain_token = token_str.split("|", 1)
    
    # Sanctum stocke le hash SHA-256 du token en base
    hashed_token = hashlib.sha256(plain_token.encode()).hexdigest()
    
    pool = await get_db_pool()
    if not pool:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur de connexion à la base de données d'authentification"
        )

    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # 1. Vérifier le token dans la table personal_access_tokens
            await cur.execute(
                "SELECT id, tokenable_type, tokenable_id, expires_at FROM personal_access_tokens WHERE id = %s AND token = %s",
                (token_id, hashed_token)
            )
            token_record = await cur.fetchone()

            if not token_record:
                print(f"DEBUG AUTH: Token introuvable en base. ID: {token_id}, HASH: {hashed_token}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token invalide ou expiré"
                )

            # 2. Vérifier l'utilisateur associé
            model_info = MODEL_MAP.get(token_record['tokenable_type'])
            if not model_info:
                print(f"DEBUG AUTH: Type d'utilisateur non supporté: {token_record['tokenable_type']}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Type d'utilisateur non supporté : {token_record['tokenable_type']}"
                )

            query = f"SELECT {model_info['fields']} FROM {model_info['table']} WHERE id = %s"
            await cur.execute(query, (token_record['tokenable_id'],))
            user = await cur.fetchone()

            if not user:
                print(f"DEBUG AUTH: Utilisateur introuvable pour ID: {token_record['tokenable_id']} et table {model_info['table']}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Utilisateur introuvable"
                )
            
            # Mettre à jour last_used_at
            await cur.execute(
                "UPDATE personal_access_tokens SET last_used_at = NOW() WHERE id = %s",
                (token_id,)
            )

    # Ajouter le rôle au dictionnaire utilisateur
    user['role'] = model_info['role']
    return user
