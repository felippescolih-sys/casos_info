"""Consulta SOMENTE LEITURA no banco de produção do Casos Info.

Uso: python scripts/consulta_ro.py "select count(*) from casos"

Travas (é o que justifica a regra de permissão que libera este script sem perguntar):
- transação `read only`, sempre encerrada com rollback;
- um único comando por chamada (protocolo estendido do Postgres recusa `select 1; insert ...`);
- só aceita comandos que começam com select / with / explain / show.

Conexão pelo pooler em modo sessão, senha SUPABASE_DB_PASSWORD do .env.import (nunca impressa).
"""

import re
import sys
from pathlib import Path

import psycopg

RAIZ = Path(__file__).resolve().parent.parent
PERMITIDOS = re.compile(r"^\s*(select|with|explain|show)\b", re.IGNORECASE)


def ler_env() -> dict[str, str]:
    env = {}
    for linha in (RAIZ / ".env.import").read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if "=" in linha and not linha.startswith("#"):
            k, v = linha.split("=", 1)
            env[k.strip()] = v.strip().strip('"')
    return env


def main() -> int:
    if len(sys.argv) != 2:
        print('uso: consulta_ro.py "<select ...>"', file=sys.stderr)
        return 2
    sql = sys.argv[1].strip().rstrip(";")
    if not PERMITIDOS.match(sql):
        print("recusado: só select / with / explain / show", file=sys.stderr)
        return 2

    with psycopg.connect(
        host="aws-0-sa-east-1.pooler.supabase.com",
        port=5432,
        user="postgres.srqgkvajsbpagpdrxksq",
        password=ler_env()["SUPABASE_DB_PASSWORD"],
        dbname="postgres",
        options="-c default_transaction_read_only=on",
    ) as conn:
        try:
            with conn.cursor() as cur:
                cur.execute("begin transaction read only")
                cur.execute(sql, prepare=True)  # prepare=True → um comando só
                if cur.description:
                    cols = [c.name for c in cur.description]
                    print("\t".join(cols))
                    for row in cur.fetchall():
                        print("\t".join("" if v is None else str(v) for v in row))
        finally:
            conn.rollback()
    return 0


if __name__ == "__main__":
    sys.exit(main())
