#!/bin/bash
# Runs once, on first initialization of an empty pgdata volume.
# Creates the en-workspace database alongside the default POSTGRES_DB.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-'EOSQL'
  SELECT 'CREATE DATABASE langlearn_en'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'langlearn_en')\gexec
EOSQL
