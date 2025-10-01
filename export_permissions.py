#!/usr/bin/env python3
"""
Exporta permissões de arquivos e pastas de um caminho UNC ou local para CSV.
Resolve SIDs para nomes de usuários/grupos legíveis.

Uso:
    python export_permissions.py "\\\\192.168.13.10\\rede gelele" saida.csv
"""

import os
import sys
import subprocess
import csv
import platform

def sid_to_name(sid):
    """Converte SID em nome legível no Windows usando PowerShell"""
    if not sid.startswith("S-1-"):
        return sid  # Já é nome legível
    try:
        cmd = [
            "powershell",
            "-Command",
            f"(New-Object System.Security.Principal.SecurityIdentifier('{sid}')).Translate([System.Security.Principal.NTAccount]).Value"
        ]
        completed = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        name = completed.stdout.strip()
        return name if name else sid
    except:
        return sid

def parse_icacls_output(output):
    """
    Recebe saída do icacls e retorna lista de tuplas (user/group, permission)
    """
    entries = []
    lines = output.splitlines()
    for line in lines[1:]:  # a primeira linha é o caminho
        line = line.strip()
        if not line:
            continue
        # Formato típico: "USUÁRIO:(F)" ou "USUÁRIO:(R)"
        if ':' in line:
            try:
                user, perm = line.split(':', 1)
                user = user.strip()
                perm = perm.strip().strip('()')
                user = sid_to_name(user)
                entries.append((user, perm))
            except ValueError:
                continue
    return entries

def run_icacls(path):
    """Executa icacls e retorna lista de (user, permission)"""
    try:
        completed = subprocess.run(
            ["icacls", path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            shell=False
        )
        out = completed.stdout if completed.stdout else ""
        return parse_icacls_output(out)
    except FileNotFoundError:
        return []

def gather_permissions(root_path, writer):
    """Percorre diretórios e arquivos recursivamente e escreve permissões no CSV"""
    sys_platform = platform.system().lower()
    is_windows = sys_platform.startswith("windows")
    total = 0

    for dirpath, dirnames, filenames in os.walk(root_path):
        # Diretório
        total += 1
        type_ = "directory"
        if is_windows:
            perms = run_icacls(dirpath)
            for user, perm in perms:
                writer.writerow([dirpath, type_, user, perm])

        # Arquivos
        type_ = "file"
        for fname in filenames:
            full = os.path.join(dirpath, fname)
            total += 1
            if is_windows:
                perms = run_icacls(full)
                for user, perm in perms:
                    writer.writerow([full, type_, user, perm])
    return total

def main():
    if len(sys.argv) < 3:
        print("Uso: python export_permissions.py <caminho> <saida.csv>")
        sys.exit(1)

    root = sys.argv[1]
    out_file = sys.argv[2]

    if not os.path.exists(root):
        print(f"Atenção: caminho não existe/indisponível: {root}")
        sys.exit(2)

    try:
        with open(out_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile, delimiter=';')
            writer.writerow(['PATH','TYPE','USER/GROUP','PERMISSION'])
            total = gather_permissions(root, writer)
        print(f"Concluído. {total} entradas escritas em: {out_file}")
    except Exception as e:
        print("Erro:", e)
        sys.exit(3)

if __name__ == "__main__":
    main()
