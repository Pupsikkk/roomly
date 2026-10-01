# Postgres

| Папка | Призначення |
|---|---|
| `init/` | SQL при першому старті (`CREATE DATABASE ...`) |
| `data/` | bind mount; реальні файли БД в `data/pgdata/` (через `PGDATA`) |

Скинути БД: `npm run down`, потім `rm -rf infra/postgres/data/pgdata` і `npm run infra`.

Якщо Postgres уже був ініціалізований раніше, `init/` більше не виконується — додайте БД вручну:

```sql
CREATE DATABASE media_db;
```
