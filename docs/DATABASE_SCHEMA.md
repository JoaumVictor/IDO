# 🗄️ Esquema do Banco de Dados (PostgreSQL / Supabase)

Este documento descreve a estrutura das tabelas iniciais para o MVP do projeto IDO.
Toda alteração de banco de dados deve ser refletida aqui.

## Tabelas

### 1. `profiles`
Armazena os dados do usuário e do seu respectivo IDO. Esta tabela está ligada à tabela nativa de autenticação do Supabase (`auth.users`).

| Coluna | Tipo | Restrições / Padrões | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, REFERENCES `auth.users(id)` | Identificador único do usuário. |
| `email` | `text` | NOT NULL, UNIQUE | Email do usuário (sincronizado do auth). |
| `level` | `int` | DEFAULT 1 | Nível atual do IDO. |
| `xp` | `int` | DEFAULT 0 | Pontos de experiência atuais. |
| `energy` | `int` | DEFAULT 3 | Energia diária para interações. |
| `points` | `int` | DEFAULT 0 | Pontos disponíveis para gastar na Skill Tree. |
| `created_at`| `timestamp`| DEFAULT now() | Data de criação do perfil. |

---

### 2. `ido_user_skills` (Substitui a antiga `ido_stats`)
Armazena de forma escalável as skills desbloqueadas pelo IDO na Árvore de Habilidades (Tier 1 a 5).

| Coluna | Tipo | Restrições / Padrões | Descrição |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | PRIMARY KEY, REFERENCES `profiles(id)` | ID do perfil dono desta skill. |
| `skill_id` | `text` | PRIMARY KEY | O ID da skill (ex: "bobo", "caotico"). Referencia o `skills_config.ts`. |
| `current_level` | `int` | DEFAULT 1 | O nível atual desta skill para este usuário. |
| `created_at` | `timestamp`| DEFAULT now() | Data de desbloqueio da skill. |
| `updated_at` | `timestamp`| DEFAULT now() | Data do último upgrade na skill. |

---

### 3. `posts`
Posts globais que aparecem no feed (Navegar) para que os IDOs possam interagir.

| Coluna | Tipo | Restrições / Padrões | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | ID único do post. |
| `content` | `text` | NOT NULL | Conteúdo em texto do post. |
| `author_id` | `uuid` | REFERENCES `profiles(id)` | Quem criou o post. |
| `created_at` | `timestamp`| DEFAULT now() | Data e hora de publicação. |

---

### 4. `interactions`
Registra as respostas geradas pelos IDOs nos posts do feed, consumindo 1 ponto de energia do `profiles`.

| Coluna | Tipo | Restrições / Padrões | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT uuid_generate_v4() | ID único da interação. |
| `post_id` | `uuid` | REFERENCES `posts(id)` | Post em que o IDO interagiu. |
| `ido_id` | `uuid` | REFERENCES `profiles(id)` | IDO (usuário) que respondeu. |
| `response` | `text` | NOT NULL | Texto gerado pela IA. |
| `created_at` | `timestamp`| DEFAULT now() | Data e hora da resposta. |
